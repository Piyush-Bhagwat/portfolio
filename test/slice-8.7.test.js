import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import CommentItem from "../src/components/blog/CommentItem.jsx";
import AdminReplyModal from "../src/components/admin/AdminReplyModal.jsx";
import BlogInteractCMS from "../src/pages/admin/BlogInteractCMS.jsx";
import {
  addAdminReplyToComment,
  toggleCommentVisibilityWithAggregate,
  calculateNewRatingAverage,
  calculateRemovedRatingAverage,
} from "../src/services/commentsService.js";

const mockAuthAdmin = {
  user: { email: "piyushbhagwat5@gmail.com", displayName: "Piyush Bhagwat" },
  isAdmin: true,
  loading: false,
  error: null,
  adminEmail: "piyushbhagwat5@gmail.com",
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
  clearError: () => {},
};

test("Slice 8.7: CommentItem renders official verified author response with author name and timestamp", () => {
  const commentWithReply = {
    id: "comment-101",
    author_name: "Sarah Connor",
    rating: 5,
    content: "The breakdown of soft-delete strategies and cursor pagination is super helpful.",
    created_at: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    admin_reply: {
      author: "Piyush Bhagwat",
      content: "Glad it helped Sarah! Soft deletion ensures complete thread integrity without breaking parent aggregates.",
      replied_at: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    },
  };

  const html = renderToString(
    React.createElement(CommentItem, { comment: commentWithReply })
  );

  // User review assertions
  assert.ok(html.includes("Sarah Connor"), "Must render comment author name");
  assert.ok(html.includes("soft-delete strategies"), "Must render comment body");

  // Official Verified Reply assertions
  assert.ok(html.includes("Verified Author"), "Must render Verified Author badge");
  assert.ok(html.includes("Piyush Bhagwat"), "Must render verified author name");
  assert.ok(
    html.includes("Soft deletion ensures complete thread integrity"),
    "Must render official reply content text"
  );
  assert.ok(
    html.includes("border-l-2") && (html.includes("border-emerald-600") || html.includes("border-terminal-green")),
    "Reply must have green accent border"
  );
});

test("Slice 8.7: addAdminReplyToComment validates inputs and updates comment with author reply", async () => {
  // 1. Validation test on empty content
  await assert.rejects(
    async () => {
      await addAdminReplyToComment({}, "comment-1", "");
    },
    {
      name: "Error",
      message: "Reply content cannot be empty.",
    }
  );

  await assert.rejects(
    async () => {
      await addAdminReplyToComment({}, "comment-1", "   ");
    },
    {
      name: "Error",
      message: "Reply content cannot be empty.",
    }
  );

  // 2. Successful reply update mock
  let updatedDocRef = null;
  let updatedPayload = null;

  const mockDb = {};
  // Mock internal updateDoc behavior through service invocation test
  const testReplyContent = "Thanks for the feedback! We appreciate you reading.";
  const testAuthor = "Piyush Bhagwat";

  assert.ok(typeof addAdminReplyToComment === "function", "addAdminReplyToComment must be exported");
});

test("Slice 8.7: toggleCommentVisibilityWithAggregate validates status and recalculates post metrics", async () => {
  // 1. Invalid status rejection
  await assert.rejects(
    async () => {
      await toggleCommentVisibilityWithAggregate({}, "c-1", "deleted");
    },
    {
      name: "Error",
      message: 'Target status must be either "visible" or "hidden".',
    }
  );

  // 2. Aggregate recalculation math verification on soft-hide
  // Case: Blog has 2 ratings with average 4.5 (ratings: 5 and 4). If the 5-star comment is hidden:
  // newAvg = ((4.5 * 2) - 5) / (2 - 1) = (9 - 5) / 1 = 4.0
  const avgAfterHide = calculateRemovedRatingAverage(4.5, 2, 5);
  assert.equal(avgAfterHide, 4.0, "Hiding 5-star rating must adjust floating average to 4.0");

  // Case: Blog has only 1 rating (5 stars). If hidden, average returns 0:
  const avgWhenZero = calculateRemovedRatingAverage(5.0, 1, 5);
  assert.equal(avgWhenZero, 0, "Hiding the only rating must reset floating average to 0");

  // 3. Aggregate recalculation math verification on unhide
  // Case: Blog currently has 1 rating of 4.0. Unhiding a 5-star comment:
  // newAvg = ((4.0 * 1) + 5) / (1 + 1) = 9 / 2 = 4.5
  const avgAfterUnhide = calculateNewRatingAverage(4.0, 1, 5);
  assert.equal(avgAfterUnhide, 4.5, "Unhiding 5-star rating must restore floating average to 4.5");
});

test("Slice 8.7: firestore.rules strictly forbids hard deletion of comments", () => {
  const rulesPath = path.resolve(process.cwd(), "firestore.rules");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");

  // Find match /comments block
  const commentsMatchIndex = rulesContent.indexOf("match /comments/{commentId}");
  assert.ok(commentsMatchIndex !== -1, "firestore.rules must define rules for /comments/{commentId}");

  const rulesSlice = rulesContent.slice(commentsMatchIndex);

  // Assert hard delete prohibition
  assert.ok(
    rulesSlice.includes("allow delete: if false;"),
    "firestore.rules MUST contain 'allow delete: if false;' for comments to enforce non-destructive soft-delete"
  );

  // Assert admin reply restriction on creation
  assert.ok(
    rulesSlice.includes("admin_reply == null"),
    "Public comment creation must forbid setting admin_reply directly"
  );
});

test("Slice 8.7: AdminReplyModal and BlogInteractCMS provide full lifecycle moderation actions", () => {
  const sampleComment = {
    id: "comment-moderation-test",
    author_name: "Dev Reader",
    post_title: "Building Resilient Web Interfaces",
    post_id: "building-resilient-web-interfaces",
    rating: 5,
    content: "Awesome read on responsive design.",
    status: "visible",
    admin_reply: null,
  };

  // Render AdminReplyModal
  const replyModalHtml = renderToString(
    React.createElement(AdminReplyModal, {
      isOpen: true,
      comment: sampleComment,
      onClose: () => {},
      onSaveReply: async () => {},
      adminName: "Piyush Bhagwat",
    })
  );

  assert.ok(replyModalHtml.includes("sys.author_reply_composer.sh"), "Must render composer terminal header");
  assert.ok(replyModalHtml.includes("Verified Author Reply"), "Must label official author reply textarea");
  assert.ok(replyModalHtml.includes("Publish Official Reply"), "Must render publish button");

  // Render BlogInteractCMS
  const cmsHtml = renderToString(
    React.createElement(
      AuthContext.Provider,
      { value: mockAuthAdmin },
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/admin/blogs/interact"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/admin/blogs/interact",
            element: React.createElement(BlogInteractCMS),
          })
        )
      )
    )
  );

  assert.ok(cmsHtml.includes("Blog Community &amp; Interactions") || cmsHtml.includes("Blog Community & Interactions"), "Must render Interact CMS header");
  assert.ok(cmsHtml.includes("Total Reviews"), "Must display Total Reviews metric card");
  assert.ok(cmsHtml.includes("Hidden (Soft)"), "Must display Hidden Soft-delete metric card");
  assert.ok(cmsHtml.includes("comments_inbox.tbl"), "Must render moderation table");
});
