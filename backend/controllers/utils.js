class ControllersUtils {
  getLimitOffset(req) {
    let limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    if (limit > process.env.MAX_LIMIT_RESULTS) {
      limit = process.env.MAX_LIMIT_RESULTS;
    }

    return {
      limit: limit,
      offset: offset,
    };
  }
}

export default new ControllersUtils();
