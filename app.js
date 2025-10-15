app.get("/about", (req, res) => {
  const team = [
    {
      name: "K Ramesh",
      role: "Full Stack Developer",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
    {
      name: "Alex Johnson",
      role: "UI/UX Designer",
      img: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
    },
    {
      name: "Priya Sharma",
      role: "Backend Engineer",
      img: "https://cdn-icons-png.flaticon.com/512/2922/2922656.png",
    },
  ];

  res.render("about", { title: "About Us", company: "about/", team }); // ✅ remove .pug extension
});
