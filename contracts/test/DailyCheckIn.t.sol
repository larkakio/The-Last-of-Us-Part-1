// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn internal c;
    address internal alice = address(0xA11ce);

    function setUp() public {
        c = new DailyCheckIn();
    }

    function test_RevertOnValue() public {
        vm.expectRevert(DailyCheckIn.NoValueAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckIn() public {
        vm.startPrank(alice);
        uint256 day = c.currentDay();
        vm.expectEmit(true, true, true, true);
        emit DailyCheckIn.CheckedIn(alice, day, 1);
        c.checkIn();
        assertEq(c.lastCheckDay(alice), day);
        assertEq(c.streakCount(alice), 1);
        vm.stopPrank();
    }

    function test_DoubleSameDayReverts() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_StreakNextDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 1 days);
        c.checkIn();
        assertEq(c.streakCount(alice), 2);
        vm.stopPrank();
    }

    function test_StreakResetsAfterGap() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 3 days);
        c.checkIn();
        assertEq(c.streakCount(alice), 1);
        vm.stopPrank();
    }
}
