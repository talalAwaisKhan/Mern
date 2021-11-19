const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

//@route  Post api/post
//@desc   create a post
//@access  private
router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      //whats this how does this work
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route  Get api/post
//@desc   get all post
//@access  private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route  Get api/post/:id
//@desc   get post by id
//@access  private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    //Whats this
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route  Delete api/post/:id
//@desc   del post by id
//@access  private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(401).json({ msg: "post not found" });
    }
    //check post by user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User Unauthorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      res.status(401).json({ msg: "post not found" });
    }
    res.status(400).send("Server Error");
  }
});

//@route  put api/post/like/:id
//@desc   like a post
//@access  private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post has already been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(401).send("Server Error");
  }
});
//@route  put api/post/unlike/:id
//@desc   unlike a post
//@access  private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post has already been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post yet to be liked" });
    }
    //get the remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(401).send("Server Error");
  }
});

//@route  Post api/post/commenta/:id
//@desc   comment on a post
//@access  private
router.post(
  "/comments/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const post = await Post.findById(req.params.id);
      //whats this how does this work
      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route  Post api/post/comments/:id/:comment_id
//@desc   cdelete comment
//@access  private
router.delete("/comments/:id/:comment_id", auth, async (req, res) => {
  try {
    console.log("1");
    const post = await Post.findById(req.params.id);
    //pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    console.log("2");
    //make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: "commnt doesnt exist" });
    }
    console.log("3");
    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "user not authorized" });
    }
    console.log("4");
    //get the remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    console.log("5");
    await post.save();
    res.json(post.comments);
    console.log("6 ");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
