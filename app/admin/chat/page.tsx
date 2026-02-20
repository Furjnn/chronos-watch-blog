import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAblyConfigured } from "@/lib/ably-server";
import { ADMIN_CHAT_FETCH_LIMIT, type AdminChatMessagePayload } from "@/lib/admin-chat";
import AdminChatClient from "@/components/admin/AdminChatClient";

export const dynamic = "force-dynamic";

function toMessagePayload(message: {
  id: string;
  content: string;
  senderUserId: string;
  createdAt: Date;
  sender: {
    name: string;
    avatar: string | null;
    role: string;
  };
}): AdminChatMessagePayload {
  return {
    id: message.id,
    content: message.content,
    senderUserId: message.senderUserId,
    senderName: message.sender.name,
    senderAvatar: message.sender.avatar || "",
    senderRole: message.sender.role,
    createdAt: message.createdAt.toISOString(),
  };
}

export default async function AdminChatPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "ADMIN" && session.role !== "EDITOR") {
    redirect("/admin");
  }

  const [messages, currentUser] = await Promise.all([
    prisma.adminChatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: ADMIN_CHAT_FETCH_LIMIT,
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    }),
  ]);

  return (
    <AdminChatClient
      currentUserId={session.id}
      currentUserName={currentUser?.name || session.email}
      initialMessages={messages.reverse().map(toMessagePayload)}
      realtimeEnabled={isAblyConfigured()}
    />
  );
}
