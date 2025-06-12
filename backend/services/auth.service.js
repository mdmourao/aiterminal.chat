class AuthService {
  getUserInfo(req) {
    return req.user;
  }
}

export default new AuthService();
