#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOAD_TESTS_DIR="$PROJECT_ROOT/load-tests"
REPORTS_DIR="$PROJECT_ROOT/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$REPORTS_DIR"

API_BASE_URL="${API_BASE_URL:-http://localhost:3001/api}"
WS_BASE_URL="${WS_BASE_URL:-ws://localhost:3001}"
AUTH_TOKEN="${AUTH_TOKEN:-test-token}"

export API_BASE_URL
export WS_BASE_URL
export AUTH_TOKEN

echo "=========================================="
echo "Performance Testing Suite"
echo "=========================================="
echo "API Base URL: $API_BASE_URL"
echo "WebSocket URL: $WS_BASE_URL"
echo "Report Directory: $REPORTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="
echo ""

check_k6_installed() {
    if ! command -v k6 &> /dev/null; then
        echo "Error: k6 is not installed"
        echo "Install k6 from: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
}

check_api_health() {
    echo "Checking API health..."
    if curl -s "$API_BASE_URL/../health" > /dev/null 2>&1; then
        echo "✓ API is healthy"
    else
        echo "⚠ Warning: API health check failed. Tests may fail."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

run_test() {
    local test_file=$1
    local test_name=$2
    local output_json="$REPORTS_DIR/${test_name}_${TIMESTAMP}.json"
    local output_html="$REPORTS_DIR/${test_name}_${TIMESTAMP}.html"

    echo ""
    echo "=========================================="
    echo "Running: $test_name"
    echo "=========================================="

    k6 run \
        --out json="$output_json" \
        "$test_file"

    echo ""
    echo "Generating HTML report for $test_name..."
    k6 report "$output_json" --output "$output_html" 2>/dev/null || \
    echo "HTML report generation skipped (k6 report plugin not installed)"

    echo "✓ Test completed: $test_name"
    echo "  JSON Report: $output_json"
    echo "  HTML Report: $output_html"
}

run_scenario() {
    local scenario_file=$1
    local scenario_name=$2
    local output_json="$REPORTS_DIR/${scenario_name}_${TIMESTAMP}.json"
    local output_html="$REPORTS_DIR/${scenario_name}_${TIMESTAMP}.html"

    echo ""
    echo "=========================================="
    echo "Running Scenario: $scenario_name"
    echo "=========================================="

    k6 run \
        --out json="$output_json" \
        "$scenario_file"

    echo ""
    echo "Generating HTML report for $scenario_name..."
    k6 report "$output_json" --output "$output_html" 2>/dev/null || \
    echo "HTML report generation skipped"

    echo "✓ Scenario completed: $scenario_name"
    echo "  JSON Report: $output_json"
    echo "  HTML Report: $output_html"
}

generate_summary() {
    local summary_file="$REPORTS_DIR/summary_${TIMESTAMP}.txt"

    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="

    echo "Performance Test Suite - $TIMESTAMP" > "$summary_file"
    echo "==========================================" >> "$summary_file"
    echo "" >> "$summary_file"
    echo "API Base URL: $API_BASE_URL" >> "$summary_file"
    echo "WebSocket URL: $WS_BASE_URL" >> "$summary_file"
    echo "" >> "$summary_file"
    echo "Test Results:" >> "$summary_file"
    echo "-------------" >> "$summary_file"

    for report in "$REPORTS_DIR"/*_${TIMESTAMP}.json; do
        if [ -f "$report" ]; then
            local test_name=$(basename "$report" "_${TIMESTAMP}.json")
            echo "" >> "$summary_file"
            echo "Test: $test_name" >> "$summary_file"
            echo "Report: $report" >> "$summary_file"
        fi
    done

    echo "" >> "$summary_file"
    echo "To view detailed results, open the HTML reports in your browser." >> "$summary_file"

    cat "$summary_file"
    echo ""
    echo "Summary saved to: $summary_file"
}

show_menu() {
    echo ""
    echo "Select tests to run:"
    echo "1) All tests"
    echo "2) API Load Test"
    echo "3) Match Simulation Test"
    echo "4) WebSocket Load Test"
    echo "5) Concurrent Login Scenario"
    echo "6) API Throughput Scenario"
    echo "7) Database Performance Scenario"
    echo "8) Simultaneous Matches Scenario"
    echo "9) Exit"
    echo ""
}

run_all_tests() {
    run_test "$LOAD_TESTS_DIR/api-load-test.js" "api-load-test"
    run_test "$LOAD_TESTS_DIR/match-simulation-test.js" "match-simulation-test"
    run_test "$LOAD_TESTS_DIR/websocket-load-test.js" "websocket-load-test"

    run_scenario "$LOAD_TESTS_DIR/scenarios/concurrent-login.js" "concurrent-login"
    run_scenario "$LOAD_TESTS_DIR/scenarios/api-throughput.js" "api-throughput"
    run_scenario "$LOAD_TESTS_DIR/scenarios/database-performance.js" "database-performance"
    run_scenario "$LOAD_TESTS_DIR/scenarios/simultaneous-matches.js" "simultaneous-matches"

    generate_summary
}

main() {
    check_k6_installed
    check_api_health

    if [ $# -eq 0 ]; then
        show_menu
        read -p "Enter choice [1-9]: " choice
        echo ""

        case $choice in
            1)
                run_all_tests
                ;;
            2)
                run_test "$LOAD_TESTS_DIR/api-load-test.js" "api-load-test"
                generate_summary
                ;;
            3)
                run_test "$LOAD_TESTS_DIR/match-simulation-test.js" "match-simulation-test"
                generate_summary
                ;;
            4)
                run_test "$LOAD_TESTS_DIR/websocket-load-test.js" "websocket-load-test"
                generate_summary
                ;;
            5)
                run_scenario "$LOAD_TESTS_DIR/scenarios/concurrent-login.js" "concurrent-login"
                generate_summary
                ;;
            6)
                run_scenario "$LOAD_TESTS_DIR/scenarios/api-throughput.js" "api-throughput"
                generate_summary
                ;;
            7)
                run_scenario "$LOAD_TESTS_DIR/scenarios/database-performance.js" "database-performance"
                generate_summary
                ;;
            8)
                run_scenario "$LOAD_TESTS_DIR/scenarios/simultaneous-matches.js" "simultaneous-matches"
                generate_summary
                ;;
            9)
                echo "Exiting..."
                exit 0
                ;;
            *)
                echo "Invalid choice"
                exit 1
                ;;
        esac
    else
        case "$1" in
            all)
                run_all_tests
                ;;
            api)
                run_test "$LOAD_TESTS_DIR/api-load-test.js" "api-load-test"
                generate_summary
                ;;
            match)
                run_test "$LOAD_TESTS_DIR/match-simulation-test.js" "match-simulation-test"
                generate_summary
                ;;
            websocket)
                run_test "$LOAD_TESTS_DIR/websocket-load-test.js" "websocket-load-test"
                generate_summary
                ;;
            *)
                echo "Usage: $0 [all|api|match|websocket]"
                exit 1
                ;;
        esac
    fi

    echo ""
    echo "=========================================="
    echo "All tests completed!"
    echo "=========================================="
    echo ""
    echo "Reports are available in: $REPORTS_DIR"
    echo ""
}

main "$@"
