// import express from "express";
// import { setupApp } from "../src/setup-app";
// import { CommentInputModel } from "../src/routers/router-types/comment-input-model";
// import request from "supertest";
// import { closeDB, runDB } from "../src/db/mongo.db";
// import { HttpStatus } from "../src/common/http-statuses/http-statuses";
// import {
//     COMMENTS_PATH,
//     TESTING_PATH,
// } from "../src/routers/pathes/router-pathes";
// import { dataCommandRepository } from "../src/repository-layers/command-repository-layer/command-repository";
// import { dataQueryRepository } from "../src/repository-layers/query-repository-layer/query-repository";
//
// describe("Test API for managing comments wrote by qwen", () => {
//     const testApp = express();
//     setupApp(testApp);
//
//     beforeAll(async () => {
//         await runDB();
//
//         const res = await request(testApp).delete(`${TESTING_PATH}/all-data`);
//         expect(res.status).toBe(204);
//     });
//
//     afterAll(async () => {
//         await closeDB();
//     });
//
//     let blogId_1: string | undefined = "";
//     let blogId_2: string | undefined = "";
//     let postId_1: string | undefined = "";
//     let postId_2: string | undefined = "";
//     let commentId_1: string | undefined = "";
//     let commentId_2: string | undefined = "";
//
//     it("Creating test base entries, directly without endpoint calls", async () => {
//         const newBlog_1: any = {
//             name: "blogger_001",
//             description: "takoy sebe blogger...",
//             websiteUrl: "https://takoy.blogger.com",
//         };
//         blogId_1 = await dataCommandRepository.createNewBlog(newBlog_1);
//
//         if (blogId_1) {
//             const newPost_1: any = {
//                 title: "post blog 001",
//                 shortDescription: "post ni o 4em",
//                 content: "Eto testovoe napolnenie posta 001_001",
//                 blogId: blogId_1,
//             };
//             postId_1 = await dataCommandRepository.createNewPost(newPost_1);
//             if (!postId_1) {
//                 throw new Error(
//                     "Failed to createNewPost, returned undefined...",
//                 );
//             }
//
//             const newPost_2: any = {
//                 title: "post blog 002",
//                 shortDescription: "post ni o 4em",
//                 content: "Eto testovoe napolnenie posta 001_002",
//                 blogId: blogId_1,
//             };
//             const insertedPost_2 =
//                 await dataCommandRepository.createNewPost(newPost_2);
//             if (!insertedPost_2) {
//                 throw new Error(
//                     "Failed to createNewPost, returned undefined...",
//                 );
//             }
//         } else {
//             throw new Error("Could not create new blog - newBlog_1");
//         }
//
//         const newBlog_2: any = {
//             name: "blogger_002",
//             description: "a eto klassnii blogger!",
//             websiteUrl: "https://klassnii.blogger.com",
//         };
//         blogId_2 = await dataCommandRepository.createNewBlog(newBlog_2);
//
//         if (blogId_2) {
//             const newPost_3: any = {
//                 title: "post blog 001",
//                 shortDescription: "horowii post",
//                 content: "Eto testovoe napolnenie posta 002_001",
//                 blogId: blogId_2,
//             };
//             postId_2 = await dataCommandRepository.createNewPost(newPost_3);
//             if (!postId_2) {
//                 throw new Error(
//                     "Failed to createNewPost, returned undefined...",
//                 );
//             }
//
//             const newPost_4: any = {
//                 title: "post blog 002",
//                 shortDescription: "horowii post",
//                 content: "Eto testovoe napolnenie posta 002_002",
//                 blogId: blogId_2,
//             };
//             const insertedPost_4 =
//                 await dataCommandRepository.createNewPost(newPost_4);
//             if (!insertedPost_4) {
//                 throw new Error(
//                     "Failed to createNewPost, returned undefined...",
//                 );
//             }
//         }
//     });
//
//     it("GET '/api/comments/{id}' - should find a comment entry and respond with a CommentViewModel-formatted info about a requested comment", async () => {
//         const res = await request(testApp).get(
//             `${COMMENTS_PATH}/${commentId_1}`,
//         );
//
//         const propertyCount = Object.keys(res.body).length;
//         expect(propertyCount).toBe(7);
//
//         expect(res.body).toHaveProperty("id", commentId_1);
//         expect(res.body).toHaveProperty("title", "comment on post");
//         expect(res.body).toHaveProperty("shortDescription", "a short comment");
//         expect(res.body).toHaveProperty("content", "this is a test comment");
//         expect(res.body).toHaveProperty("postId", postId_1);
//         expect(res.body).toHaveProperty("blogName", "blogger_001");
//         expect(res.body).toHaveProperty("createdAt");
//
//         expect(res.status).toBe(HttpStatus.Ok);
//     });
//
//     it("GET '/api/comments/{id}' - shouldn't be able to insert a comment because of non-existent post ID, should respond with proper error-return message", async () => {
//         const res = await request(testApp).get(`${COMMENTS_PATH}/0000`);
//         expect(res.status).toBe(HttpStatus.BadRequest);
//     });
//
//     it("PUT '/api/comments/{id}' - should update a comment", async () => {
//         if (postId_2) {
//             const updatedCommentInput: CommentInputModel = {
//                 content: "this is an updated test comment",
//             };
//
//             const res = await request(testApp)
//                 .put(`${COMMENTS_PATH}/${commentId_1}`)
//                 .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5")
//                 .send(updatedCommentInput);
//             expect(res.status).toBe(HttpStatus.NoContent);
//
//             const anotherResults = await request(testApp).get(
//                 `${COMMENTS_PATH}/${commentId_1}`,
//             );
//             expect(anotherResults).toBeDefined();
//             const propertyCount = Object.keys(anotherResults.body).length;
//             expect(propertyCount).toBe(7);
//             expect(anotherResults.status).toBe(HttpStatus.Ok);
//         } else {
//             throw new Error("postId_2 is not defined");
//         }
//     });
//
//     it("PUT '/api/comments/{id}' - shouldn't be able to update a comment because of incorrect login/password pair", async () => {
//         if (postId_2) {
//             const updatedCommentInput: CommentInputModel = {
//                 content: "this is an updated test comment",
//             };
//
//             const res = await request(testApp)
//                 .put(`${COMMENTS_PATH}/${commentId_1}`)
//                 .set("Authorization", "Basic " + "111111")
//                 .send(updatedCommentInput);
//             expect(res.status).toBe(HttpStatus.Unauthorized);
//
//             const anotherRes = await request(testApp)
//                 .put(`${COMMENTS_PATH}/${commentId_1}`)
//                 .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5")
//                 .send(updatedCommentInput);
//             expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
//         } else {
//             throw new Error("postId_2 is not defined");
//         }
//     });
//
//     it("DELETE '/api/comments/{id}' - shouldn't be able to delete a comment because of incorrect login/password pair", async () => {
//         const res = await request(testApp)
//             .delete(`${COMMENTS_PATH}/${commentId_1}`)
//             .set("Authorization", "Basic " + "111111");
//         expect(res.status).toBe(HttpStatus.Unauthorized);
//
//         const anotherRes = await request(testApp)
//             .delete(`${COMMENTS_PATH}/${commentId_1}`)
//             .set("Authorization", "111111 " + "YWRtaW46cXdlcnR5");
//         expect(anotherRes.status).toBe(HttpStatus.Unauthorized);
//     });
//
//     it("DELETE '/api/comments/{id}' - should delete a comment", async () => {
//         const res = await request(testApp)
//             .delete(`${COMMENTS_PATH}/${commentId_1}`)
//             .set("Authorization", "Basic " + "YWRtaW46cXdlcnR5");
//         expect(res.status).toBe(HttpStatus.NoContent);
//
//         const anotherResults = await request(testApp).get(
//             `${COMMENTS_PATH}/${commentId_1}`,
//         );
//         expect(anotherResults.status).toBe(HttpStatus.NotFound);
//     });
// });
