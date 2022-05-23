function advancedResults(model, populate) {
  return async (req, res, next) => {
    let query;

    //copy req.query
    const reqQuery = { ...req.query };

    //fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over remove and delete them
    removeFields.forEach((param) => delete reqQuery[param]);

    //create query string
    let queryString = JSON.stringify(reqQuery);

    //Creatr operators($gt, $gte)
    queryString = queryString.replace(
      "/\b(gt|gte|lt|lte|in)/g",
      (match) => `$${match}`
    );
    // Query
    query = model.find(JSON.parse(queryString)).populate(populate);

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // get total count of document
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }
    // exicution query
    const results = await query;

    // Pagination Result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };
    next();
  };
}

module.exports = advancedResults;
