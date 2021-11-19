const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

//@route
//@desc
//@access

router.get("/me", auth, async (req, res) => {
  try {
    //Explain this user: req.user.id
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      "name"
    );
    if (!profile) {
      //console.log("no profile check working 1st");
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
    // console.log(profile, "this is the profile working");
  } catch (error) {
    console.log(error.msg);
    res.status(500).send("Server Error");
  }
});

//@route  post api/profile
//@desc   create/update user profile
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "skills is arequired").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errCheckVar = validationResult(req);
    if (!errCheckVar.isEmpty()) {
      return res.status(400).json({ errors: errCheckVar.array() });
    }
    const {
      company,
      website,
      bio,
      status,
      location,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //built profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (status) {
      profileFields.status = status;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }

    if (githubusername) {
      profileFields.githubusername = githubusername;
    }
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //console.log("third check profileFields working");
    console.log(profileFields.skills);
    //building profileFieldsSocials object
    profileFields.Socials = {};
    if (youtube) profileFields.Socials.youtube = youtube;
    if (twitter) profileFields.Socials.twitter = twitter;
    if (facebook) profileFields.Socials.facebook = facebook;
    if (instagram) profileFields.Socials.instagram = instagram;
    if (linkedin) profileFields.Socials.linkedin = linkedin;
    // console.log(
    //  profileFields.Socials,
    //  "4th check getting socials from body working"
    // );
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        //console.log(profile, "profile with socails showing 5th");
        return res.json(profile);
      }
      //create incase profile not exist
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
      //console.log(profile, "6th");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route   get api/profile
//@desc    get all profiles
//@access  public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", "name");
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   get api/profile/user/user:id
//@desc    get [profile by user id]
//@access  public
router.get("/user/:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userid,
    }).populate("user", "name");
    if (!profile)
      return res.status(400).json({ msg: "There is no profile for this user" });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   Delete api/profile
//@desc    delete profile , user , posts
//@access  private
router.delete("/", auth, async (req, res) => {
  try {
    //@ remove users posts
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //this will remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "user deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   put/api/profile/experience
//@desc    add profile experience
//@access  private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "tittle is required ").not().isEmpty(),
      check("company", "compnay is required ").not().isEmpty(),
      check("from", "from is required ").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructring
    const { title, company, location, from, to, current, discript } = req.body;
    //Explain this line
    const newExp = { title, company, location, from, to, current, discript };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Explain this .experience
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

//@route   Delete api/profile/experience/:exp_id
//@desc    delete experience from profile
//@access  private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    //get profile
    const profile = await Profile.findOne({ user: req.user.id });
    //get the  remove index
    //what is this .map( ? => ?)
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    //with any =
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route   put/api/profile/education
//@desc    add profile education
//@access  private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required ").not().isEmpty(),
      check("degree", "degree is required ").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy  is required ").not().isEmpty(),
      check("from", "from is required ").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructring
    const { school, degree, fieldofstudy, from, to, current, discript } =
      req.body;
    //Explain this line
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      discript,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Explain this unshift
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

//@route   Delete api/profile/education/:edu_id
//@desc    delete education from profile
//@access  private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    //get profile
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    //with any =
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route  Get api/profile/github/:username
//@desc   get user repos from github
//@access  public

router.get("/github/:username", (req, res) => {
  try {
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});
module.exports = router;
