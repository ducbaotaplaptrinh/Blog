const postService = require('../services/postService');

class PostController {
  async getAll(req, res, next) {
    try {
      const { page, limit, category_id, category, search, status, author_id, sort, date_from, date_to } = req.query;

      // Nếu user là author, họ chỉ xem bài của chính mình trong quản trị nếu có cờ my_posts
      let filterAuthorId = author_id;
      if (req.user && req.user.role === 'author') {
        filterAuthorId = req.user.id;
      }

      const result = await postService.getAllPosts({
        page,
        limit,
        category_id,
        category,
        search,
        status,
        author_id: filterAuthorId,
        sort,
        date_from,
        date_to,
      });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách bài viết xem nhiều nhất (Public Popular)
  async getPopular(req, res, next) {
    try {
      const { limit = 5 } = req.query;
      const posts = await postService.getPopularPosts(limit);
      res.status(200).json({ status: 'success', data: posts });
    } catch (error) {
      next(error);
    }
  }

  // Thống kê số lượng bài viết theo trạng thái
  async getStats(req, res, next) {
    try {
      let author_id = null;
      if (req.user && req.user.role === 'author') {
        author_id = req.user.id;
      }
      const stats = await postService.getStats(author_id);
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách bài viết của riêng tác giả
  async getMyPosts(req, res, next) {
    try {
      const { page, limit, category_id, search, status, sort, date_from, date_to } = req.query;
      const result = await postService.getAllPosts({
        page,
        limit,
        category_id,
        search,
        status,
        author_id: req.user.id,
        sort,
        date_from,
        date_to,
      });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách bài viết đang chờ duyệt (Pending Review)
  async getPending(req, res, next) {
    try {
      const { page, limit, category_id, search, sort, date_from, date_to } = req.query;
      const result = await postService.getAllPosts({
        page,
        limit,
        category_id,
        search,
        status: 'pending',
        sort,
        date_from,
        date_to,
      });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const post = await postService.getPostBySlug(req.params.slug, req.user);
      res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { title, summary, content, thumbnail, category_id, status } = req.body;
      const author_id = req.user.id;
      const post = await postService.createPost({
        title,
        summary,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        user: req.user,
      });
      res.status(201).json({ status: 'success', data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { title, summary, content, thumbnail, category_id, status } = req.body;
      const post = await postService.updatePost(req.params.id, {
        title,
        summary,
        content,
        thumbnail,
        category_id,
        status,
        user: req.user,
      });
      res.status(200).json({ status: 'success', data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await postService.deletePost(req.params.id, req.user);
      res.status(200).json({ status: 'success', message: 'Xóa bài viết thành công' });
    } catch (error) {
      next(error);
    }
  }

  // Tác giả gửi duyệt bài
  async submit(req, res, next) {
    try {
      const post = await postService.submitPost(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Đã gửi bài viết để xét duyệt thành công',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  // Editor/Super Admin phê duyệt bài
  async approve(req, res, next) {
    try {
      const post = await postService.approvePost(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Phê duyệt và xuất bản bài viết thành công',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  // Editor/Super Admin từ chối bài
  async reject(req, res, next) {
    try {
      const post = await postService.rejectPost(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Đã từ chối bài viết kèm lý do phản hồi',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  // Like bài viết
  async like(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const result = await postService.likePost(req.params.id, userId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Chia sẻ bài viết
  async share(req, res, next) {
    try {
      const result = await postService.sharePost(req.params.id);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();
