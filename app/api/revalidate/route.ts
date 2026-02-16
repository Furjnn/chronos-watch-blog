// ═══ src/app/api/revalidate/route.ts ═══
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const body = await req.json();
    const { _type, slug } = body;

    // Revalidate affected paths based on content type
    switch (_type) {
      case "post":
        revalidatePath("/");
        revalidatePath("/blog");
        if (slug?.current) revalidatePath(`/blog/${slug.current}`);
        break;
      case "review":
        revalidatePath("/reviews");
        if (slug?.current) revalidatePath(`/reviews/${slug.current}`);
        break;
      case "brand":
        revalidatePath("/brands");
        if (slug?.current) revalidatePath(`/brands/${slug.current}`);
        break;
      case "guide":
        revalidatePath("/guides");
        if (slug?.current) revalidatePath(`/guides/${slug.current}`);
        break;
      case "author":
        if (slug?.current) revalidatePath(`/author/${slug.current}`);
        break;
      case "siteSettings":
        revalidatePath("/", "layout");
        break;
      default:
        revalidatePath("/");
    }

    return NextResponse.json({
      revalidated: true,
      type: _type,
      slug: slug?.current,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
