const express = require("express")
const Candidate = require("../models/candidate")
const User = require("../models/user")
const candidateRoute = express.Router()
const {authMiddleware} = require("../middleware/auth")


const isAdmin = async (userId) =>{
    try{
        const user = await User.findById(userId)
        return user.role === "admin";

    }catch(err){
        return false;
    }
}


candidateRoute.post("/",authMiddleware, async(req,res) => {
    try{
        if(! await isAdmin(req.userToken.id)){
            return res.status(403).json({"message": "User does not have Admin Role"})
        }
        const data = req.body;
   
        // create new candidate
        const newCandidate =  new Candidate(data)

        // save new candidate

        const response = await newCandidate.save();

        // console.log(response);

        return res.status(201).json(response)
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }
})

candidateRoute.put("/:candidateId", authMiddleware, async(req, res) => {
    try{
        if(! await isAdmin(req.userToken.id)){
            return res.status(403).json({"message": "User does not have Admin Role"})
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        if(!response){
            return res.status(400).json({"error": "Candidate Not found"});
        }
        return res.status(200).json(response)
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }
})


// voting 
candidateRoute.post("/vote/:candidateId", authMiddleware, async(req, res) => {
    // Admin can not vote
    // Every user only vote once
    const candidateId = req.params.candidateId
    const userId = req.userToken.id;
    try{
        // find the candidate with specified Id
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json("Candidate not found with this id")
        }
         // find the user with specified Id
         const user = await User.findById(userId);
         if(!user){
            return res.status(404).json("User not found with this id")
        }
        if (user.isVoted){
            return res.status(403).json("You have Already voted")
        }
        if (user.role == "admin"){
            return res.status(403).json("Admin is not Allowed to be voted")
        }
        
        // Update the candidate document to update the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true;
        await user.save();
        return res.status(200).json({message: "Vote recorded Successfully"})

    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }
})

// Vote Count 

candidateRoute.get("/vote/count", async(req,res) => {
    try{
        // find all the candidate and arrange him in descending order
        const candidate = await Candidate.find().sort({voteCount: "desc"})
        // map the candidate with only party name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                totalVotes: data.voteCount,
            }
        })

        return res.status(200).json(voteRecord)
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }

})

// List of Candidates 

candidateRoute.get("/list", async(req,res) => {
    try{
        const allCandidates = await Candidate.find()
        return res.status(200).json(allCandidates)
    }catch(err){
        console.log(err)
        return res.status(500).json("Internal Server Error")
    }

})




module.exports = candidateRoute