// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract KuraSafi {
    struct Candidate {
        uint id;
        string name;
        string party;
        string photoHash; // IPFS hash or URL
        uint voteCount;
        bool exists;
    }

    struct Election {
        uint id;
        string title;
        string description;
        uint startTime;
        uint endTime;
        bool active;
        bool exists;
    }

    address public admin;
    uint public electionCount;
    uint public candidateCount;

    mapping(uint => Election) public elections;
    mapping(uint => Candidate) public candidates;
    mapping(uint => uint[]) public electionCandidates; // electionId => candidateIds
    mapping(uint => mapping(address => bool)) public hasVoted; // electionId => address => voted
    mapping(uint => mapping(address => uint)) private voterChoice; // electionId => address => candidateId (0 = private)
    mapping(address => bool) public registeredVoters;
    mapping(string => address) public idToAddress; // kenyanId => wallet address
    mapping(address => string) public voterIds; // wallet => kenyanId

    event ElectionCreated(uint indexed electionId, string title, uint startTime, uint endTime);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string name);
    event VoteCast(uint indexed electionId, uint indexed candidateId);
    event VoterRegistered(address indexed voter, string kenyanId);
    event ElectionEnded(uint indexed electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionExists(uint _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier electionActive(uint _electionId) {
        require(elections[_electionId].active, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(
        string memory _title,
        string memory _description,
        uint _startTime,
        uint _endTime
    ) external onlyAdmin returns (uint) {
        require(_endTime > _startTime, "End time must be after start time");
        require(_endTime > block.timestamp, "End time must be in the future");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            active: true,
            exists: true
        });

        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
        return electionCount;
    }

    function addCandidate(
        uint _electionId,
        string memory _name,
        string memory _party,
        string memory _photoHash
    ) external onlyAdmin electionExists(_electionId) returns (uint) {
        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            photoHash: _photoHash,
            voteCount: 0,
            exists: true
        });

        electionCandidates[_electionId].push(candidateCount);
        emit CandidateAdded(_electionId, candidateCount, _name);
        return candidateCount;
    }

    function registerVoter(string memory _kenyanId) external {
        require(!registeredVoters[msg.sender], "Already registered");
        require(idToAddress[_kenyanId] == address(0), "ID already registered");

        registeredVoters[msg.sender] = true;
        idToAddress[_kenyanId] = msg.sender;
        voterIds[msg.sender] = _kenyanId;

        emit VoterRegistered(msg.sender, _kenyanId);
    }

    function castVote(uint _electionId, uint _candidateId)
        external
        electionExists(_electionId)
        electionActive(_electionId)
    {
        require(registeredVoters[msg.sender], "Not a registered voter");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");

        bool validCandidate = false;
        uint[] memory cands = electionCandidates[_electionId];
        for (uint i = 0; i < cands.length; i++) {
            if (cands[i] == _candidateId) {
                validCandidate = true;
                break;
            }
        }
        require(validCandidate, "Invalid candidate for this election");

        hasVoted[_electionId][msg.sender] = true;
        voterChoice[_electionId][msg.sender] = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCast(_electionId, _candidateId);
    }

    function verifyVote(uint _electionId) external view returns (bool voted) {
        return hasVoted[_electionId][msg.sender];
    }

    function getElectionCandidates(uint _electionId)
        external
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        uint[] memory ids = electionCandidates[_electionId];
        Candidate[] memory result = new Candidate[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = candidates[ids[i]];
        }
        return result;
    }

    function getElection(uint _electionId)
        external
        view
        electionExists(_electionId)
        returns (Election memory)
    {
        return elections[_electionId];
    }

    function endElection(uint _electionId) external onlyAdmin electionExists(_electionId) {
        elections[_electionId].active = false;
        emit ElectionEnded(_electionId);
    }

    function isElectionLive(uint _electionId) external view electionExists(_electionId) returns (bool) {
        Election memory e = elections[_electionId];
        return e.active && block.timestamp >= e.startTime && block.timestamp <= e.endTime;
    }

    function getTotalVotes(uint _electionId) external view electionExists(_electionId) returns (uint total) {
        uint[] memory ids = electionCandidates[_electionId];
        for (uint i = 0; i < ids.length; i++) {
            total += candidates[ids[i]].voteCount;
        }
    }
}
