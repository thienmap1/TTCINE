const getAllGenres = (req, res) => {
  const genres = [
    "Hành động",
    "Kinh dị",
    "Hài hước",
    "Tình cảm",
    "Hoạt hình",
    "Tài liệu"
  ];

  res.status(200).json(genres);
};

module.exports = { getAllGenres };
