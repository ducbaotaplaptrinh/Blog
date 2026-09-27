const commentService = require('../services/commentService');

class CommentController {
  async getAll(req, res, next) {
    try {
      const { limit, offset, page, status, search, post_id, user_id } = req.query;
      const parsedLimit = limit ? parseInt(limit, 10) : 50;
      const parsedOffset = offset ? parseInt(offset, 10) : (page ? (parseInt(page, 10) - 1) * parsedLimit : 0);

      const data = await commentService.getAllComments({
        limit: parsedLimit,
        offset: parsedOffset,
        status: status || undefined,
        search: search || undefined,
        post_id: post_id ? parseInt(post_id, 10) : undefined,
        user_id: user_id ? parseInt(user_id, 10) : undefined,
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await commentService.getCommentStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getPending(req, res, next) {
    try {
      const { limit = 20, page = 1 } = req.query;
      const parsedLimit = parseInt(limit, 10);
      const parsedOffset = (parseInt(page, 10) - 1) * parsedLimit;
      const data = await commentService.getPendingComments({
        limit: parsedLimit,
        offset: parsedOffset,
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getPostGroups(req, res, next) {
    try {
      const { limit = 15, page = 1, search = '' } = req.query;
      const parsedLimit = parseInt(limit, 10);
      const parsedOffset = (parseInt(page, 10) - 1) * parsedLimit;
      const data = await commentService.getPostCommentGroups({
        limit: parsedLimit,
        offset: parsedOffset,
        search: search.trim(),
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getAdminByPostId(req, res, next) {
    try {
      const comments = await commentService.getAdminPostComments(req.params.id);
      res.status(200).json({ status: 'success', data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const comment = await commentService.updateCommentStatus(id, status, req.user);
      res.status(200).json({
        status: 'success',
        message: `Đã cập nhật trạng thái bình luận thành "${status}"`,
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPostId(req, res, next) {
    try {
      const comments = await commentService.getCommentsByPostId(req.params.id);
      res.status(200).json({ status: 'success', data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req, res, next) {
    try {
      const comments = await commentService.getCommentsByUserId(req.params.id);
      res.status(200).json({ status: 'success', data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { post_id, content, parent_id, username, email, guest_name, guest_email } = req.body;
      const user = req.user || null;
      const user_id = user ? user.id : null;
      const comment = await commentService.createComment({
        post_id,
        user_id,
        user,
        content,
        parent_id,
        username: (username || guest_name || '').trim(),
        email: (email || guest_email || '').trim(),
      });
      res.status(201).json({ status: 'success', data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await commentService.deleteComment(req.params.id);
      res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
