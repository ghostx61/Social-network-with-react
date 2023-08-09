
const populateLikeStatus = (posts, userId) => {
    for (let post of posts) {
        let likedFlag = false;
        if (post['likes'] !== undefined) {
            for (let likeId of post.likes) {
                const newLikeId = likeId.toString();
                if (newLikeId === userId) likedFlag = true;
            }
            post.likesCount = post.likes.length;
            delete post.likes;
        } else {
            post.likesCount = 0;
        }
        post.postLiked = likedFlag;
    }
    // console.log(posts);
    // return [];
    return posts;
}

module.exports = populateLikeStatus;
