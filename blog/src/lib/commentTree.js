/**
 * Chuyển đổi danh sách bình luận phẳng (Flat Comments Array) thành Cây phân cấp (Threaded Comment Tree)
 * Độ phức tạp thời gian: O(N) với thuật toán bảng băm (Hash Map)
 */
export function buildCommentTree(flatComments = []) {
  if (!Array.isArray(flatComments) || flatComments.length === 0) {
    return [];
  }

  const commentMap = new Map();
  const rootComments = [];

  // Bước 1: Khởi tạo tất cả các node trong Map với mảng replies rỗng
  flatComments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  // Bước 2: Duyệt danh sách và gắn node vào replies của parent hoặc vào rootComments
  flatComments.forEach((comment) => {
    const node = commentMap.get(comment.id);
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id).replies.push(node);
    } else {
      rootComments.push(node);
    }
  });

  return rootComments;
}

/**
 * Đếm tổng số lượng phản hồi con cháu của một comment node (đệ quy)
 */
export function countTotalReplies(comment) {
  if (!comment || !Array.isArray(comment.replies) || comment.replies.length === 0) {
    return 0;
  }
  return comment.replies.reduce((total, reply) => {
    return total + 1 + countTotalReplies(reply);
  }, 0);
}
