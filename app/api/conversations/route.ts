import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ConversationSchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().max(200).optional(),
  messages: z.array(z.object({
    id: z.string().min(1).max(256),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(1_000_000),
  })).max(500),
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      createdAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { content: true, role: true },
      },
    },
  });

  return NextResponse.json({
    conversations: conversations.map(c => ({
      id: c.id,
      title: c.title || c.messages[0]?.content?.slice(0, 80) || 'New conversation',
      updatedAt: c.updatedAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      preview: c.messages[0]?.content?.slice(0, 200) || '',
    })),
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = ConversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });

  const { id, title, messages } = parsed.data;
  const existing = await prisma.conversation.findUnique({ where: { id }, select: { userId: true } });
  if (existing && existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.conversation.upsert({
    where: { id },
    create: {
      id,
      userId: session.user.id,
      title: title || messages.find(message => message.role === 'user')?.content.slice(0, 200),
      messages: { create: messages.map(message => ({ ...message })) },
    },
    update: {
      title: title || undefined,
      messages: {
        deleteMany: {},
        create: messages.map(message => ({ ...message })),
      },
    },
  });

  return NextResponse.json({ ok: true, id });
}
