// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. No ETH accepted — user pays L2 gas only.
/// @dev Stores `day + 1` per user; 0 means never checked (avoids ambiguity with calendar day 0).
contract DailyCheckIn {
    error NoValueAllowed();
    error AlreadyCheckedInToday();

    event CheckedIn(address indexed user, uint256 indexed day, uint256 streak);

    mapping(address => uint256) public lastDayPlusOne;
    mapping(address => uint256) public streakCount;

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function lastCheckDay(address user) public view returns (uint256) {
        uint256 p = lastDayPlusOne[user];
        return p == 0 ? 0 : p - 1;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert NoValueAllowed();

        uint256 day = currentDay();
        uint256 p = lastDayPlusOne[msg.sender];

        if (p != 0) {
            uint256 last = p - 1;
            if (last == day) revert AlreadyCheckedInToday();
        }

        uint256 newStreak;
        if (p == 0) {
            newStreak = 1;
        } else {
            uint256 last = p - 1;
            if (day == last + 1) {
                newStreak = streakCount[msg.sender] + 1;
            } else {
                newStreak = 1;
            }
        }

        lastDayPlusOne[msg.sender] = day + 1;
        streakCount[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}
