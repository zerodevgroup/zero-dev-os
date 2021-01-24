import XCTest

import nic_cliTests

var tests = [XCTestCaseEntry]()
tests += nic_cliTests.allTests()
XCTMain(tests)
