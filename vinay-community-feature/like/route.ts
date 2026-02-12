// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// /**
//  * API Route: /api/community/like
//  * Description: Handles the "Toggle Like" functionality.
//  * Logic: If the user already liked the post, remove the like. If not, add it.
//  */

// export async function POST(request: Request) {
//   try {
//     // 1. Get the Post ID from the request body
//     const { postId } = await request.json();
    
//     // 2. AUTHENTICATION (Dev Mode)
//     // We are looking up the hardcoded "Admin" user to simulate a logged-in session.
//     // In production, you would get the session user from the request cookies/headers.
//     const user = await prisma.user.findFirst({ where: { email: 'admin@hawa.com' } });
    
//     // Safety check: If our admin user doesn't exist, block the action.
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     // 3. CHECK EXISTING LIKE
//     // We check if a 'Like' entry already exists for this specific User + Post combo.
//     const existingLike = await prisma.like.findFirst({
//       where: { 
//         postId: postId, 
//         userId: user.id 
//       }
//     });

//     // 4. TOGGLE LOGIC
//     if (existingLike) {
//       // CASE A: User already liked it -> UNLIKE (Delete the record)
//       await prisma.like.delete({ where: { id: existingLike.id } });
//     } else {
//       // CASE B: User hasn't liked it yet -> LIKE (Create the record)
//       await prisma.like.create({ 
//         data: { 
//           postId: postId, 
//           userId: user.id 
//         }
//       });
//     }
    
//     // 5. Return success
//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error("Interaction failed:", error);
//     // Return a generic 500 error if the database operation fails
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }

// }
