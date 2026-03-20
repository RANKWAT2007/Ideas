const Post = require("../models/Post");

/* CREATE POST */
exports.createPost = async (req, res) => {
  try {

    const userId = req.user?.id || req.user;

    let mediaPaths = [];

    if (req.files) {
      mediaPaths = req.files.map(file => file.path);
    }

    const post = await Post.create({
      text: req.body.text,
      media: mediaPaths,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      post
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Post creation failed"
    });
  }
};


/* GET ALL POSTS */
exports.getPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts
    });

  } catch (error) {
    res.status(500).json({
      success: false
    });
  }
};


/* DELETE POST */
exports.deletePost = async (req, res) => {
  try {

    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Post not found"
      });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      msg: "Post deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Delete failed"
    });
  }
};