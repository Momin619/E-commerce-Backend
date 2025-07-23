exports.getUserProfile = (req, res, next) => {
  try {
    const user = req.session.user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(404);
    console.log(error);
  }
};
