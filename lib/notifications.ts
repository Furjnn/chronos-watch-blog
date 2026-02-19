import { NotificationChannel, NotificationStatus, Prisma, SubmissionStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { getRuntimeMailSettings } from "@/lib/mail-settings";

type NotificationInput = {
  type: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  recipientUserId?: string | null;
  recipientMemberId?: string | null;
  postId?: string | null;
  reviewId?: string | null;
  commentId?: string | null;
  payload?: unknown;
};

const RESEND_API_URL = "https://api.resend.com/emails";

export type NotificationSendResult = {
  status: NotificationStatus;
  reason?: string;
};

export async function sendNotificationEmail(input: NotificationInput) {
  const runtimeConfig = await getRuntimeMailSettings();
  const from = runtimeConfig?.fromEmail || null;
  const replyTo = runtimeConfig?.replyTo || "";

  const notification = await prisma.notificationLog.create({
    data: {
      type: input.type,
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.PENDING,
      recipientEmail: input.to,
      recipientUserId: input.recipientUserId || null,
      recipientMemberId: input.recipientMemberId || null,
      subject: input.subject,
      payload:
        input.payload === undefined
          ? undefined
          : (input.payload as Prisma.InputJsonValue),
      postId: input.postId || null,
      reviewId: input.reviewId || null,
      commentId: input.commentId || null,
    },
    select: { id: true },
  });

  if (!runtimeConfig || !from) {
    const reason = "Email provider is not configured or incomplete.";
    await prisma.notificationLog.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SKIPPED,
        errorMessage: reason,
      },
    });
    return {
      status: NotificationStatus.SKIPPED,
      reason,
    } satisfies NotificationSendResult;
  }

  try {
    if (runtimeConfig.provider === "resend") {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${runtimeConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          text: input.text,
          html: input.html || undefined,
          reply_to: replyTo || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const reason = `Resend error (${response.status}): ${body.slice(0, 500)}`;
        await prisma.notificationLog.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.FAILED,
            errorMessage: reason,
          },
        });
        return {
          status: NotificationStatus.FAILED,
          reason,
        } satisfies NotificationSendResult;
      }
    } else {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: runtimeConfig.smtpUser,
          pass: runtimeConfig.smtpPass,
        },
      });

      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html || undefined,
        replyTo: replyTo || undefined,
      });
    }

    await prisma.notificationLog.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
    return {
      status: NotificationStatus.SENT,
    } satisfies NotificationSendResult;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown email send error";
    await prisma.notificationLog.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage: reason,
      },
    });
    return {
      status: NotificationStatus.FAILED,
      reason,
    } satisfies NotificationSendResult;
  }
}

export async function notifyMemberSubmissionDecision(input: {
  memberId: string;
  memberEmail: string;
  memberName: string;
  postId: string;
  postTitle: string;
  status: SubmissionStatus;
  reviewNote?: string | null;
}) {
  const isApproved = input.status === "APPROVED";
  const subject = isApproved
    ? `Your Chronos submission is approved: ${input.postTitle}`
    : `Your Chronos submission needs revision: ${input.postTitle}`;
  const text = isApproved
    ? `Hi ${input.memberName},\n\nYour submission "${input.postTitle}" has been approved and published.\n\n${input.reviewNote ? `Editor note: ${input.reviewNote}\n\n` : ""}Thanks for contributing to Chronos.`
    : `Hi ${input.memberName},\n\nYour submission "${input.postTitle}" was reviewed and needs changes before publication.\n\n${input.reviewNote ? `Editor note: ${input.reviewNote}\n\n` : ""}You can update and resubmit it from your account.`;

  await sendNotificationEmail({
    type: "MEMBER_SUBMISSION_REVIEWED",
    to: input.memberEmail,
    subject,
    text,
    recipientMemberId: input.memberId,
    postId: input.postId,
    payload: {
      postTitle: input.postTitle,
      status: input.status,
      reviewNote: input.reviewNote || null,
    },
  });
}

export async function notifyEditorsNewComment(input: {
  commentId: string;
  body: string;
  postTitle?: string | null;
  reviewTitle?: string | null;
  authorName?: string | null;
}) {
  const recipients = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "EDITOR"] } },
    select: { id: true, email: true, name: true },
  });

  await Promise.all(
    recipients.map((user) =>
      sendNotificationEmail({
        type: "COMMENT_PENDING_MODERATION",
        to: user.email,
        subject: `New comment requires moderation`,
        text: `Hi ${user.name},\n\nA new comment is waiting for moderation.\n\nContext: ${
          input.postTitle || input.reviewTitle || "Content"
        }\nAuthor: ${input.authorName || "Anonymous"}\n\nComment preview:\n${input.body.slice(0, 500)}`,
        recipientUserId: user.id,
        commentId: input.commentId,
        payload: {
          postTitle: input.postTitle || null,
          reviewTitle: input.reviewTitle || null,
          authorName: input.authorName || null,
        },
      }),
    ),
  );
}

export async function notifyEditorsNewSubmission(input: {
  postId: string;
  postTitle: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
}) {
  const recipients = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "EDITOR"] } },
    select: { id: true, email: true, name: true },
  });

  await Promise.all(
    recipients.map((user) =>
      sendNotificationEmail({
        type: "MEMBER_SUBMISSION_CREATED",
        to: user.email,
        recipientUserId: user.id,
        postId: input.postId,
        subject: "New member submission received",
        text: `Hi ${user.name},\n\nA new member submission is waiting for review.\n\nTitle: ${input.postTitle}\nMember: ${input.memberName} (${input.memberEmail})`,
        payload: {
          postTitle: input.postTitle,
          memberId: input.memberId,
          memberName: input.memberName,
          memberEmail: input.memberEmail,
        },
      }),
    ),
  );
}

export async function notifyCommentAuthorDecision(input: {
  to: string;
  name: string;
  approved: boolean;
  commentPreview: string;
}) {
  const subject = input.approved
    ? "Your comment is now visible on Chronos"
    : "Your comment has been moderated on Chronos";
  const text = input.approved
    ? `Hi ${input.name},\n\nYour comment has been approved and is now visible on Chronos.\n\nComment preview:\n${input.commentPreview}`
    : `Hi ${input.name},\n\nYour comment has been reviewed by moderators and is not published at this time.\n\nComment preview:\n${input.commentPreview}`;

  await sendNotificationEmail({
    type: "COMMENT_MODERATION_DECISION",
    to: input.to,
    subject,
    text,
    payload: {
      approved: input.approved,
      commentPreview: input.commentPreview,
    },
  });
}
