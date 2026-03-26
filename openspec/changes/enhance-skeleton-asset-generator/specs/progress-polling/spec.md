# Spec: Progress Polling UI for Skeleton Asset Generation

## ADDED Requirements

### Requirement: Real-time Progress Tracking
The system SHALL implement real-time progress tracking for skeleton generation process.

#### Scenario: Progress Polling Mechanism
Given a skeleton generation task is in progress
When the frontend polls for progress updates
Then the system should query the backend every 2 seconds
And update the progress bar with current completion percentage
And display the current processing stage

#### Scenario: Stage-based Progress Display
Given skeleton generation has multiple stages
When progress is displayed to the user
Then the system should show discrete stages: "生成全身图", "全身图完成", "分割肢体", "透明底处理", "完成"
And update the current stage as processing advances
And provide estimated time remaining for each stage

### Requirement: Visual Progress Indicators
The system SHALL create comprehensive visual indicators for generation progress.

#### Scenario: Progress Bar with Status
Given a generation task is running
When the progress bar is displayed
Then the system should show completion percentage (0-100%)
And use color coding (blue for active, green for complete, red for error)
And display smooth animations during progress updates

#### Scenario: Stage Step Indicators
Given multiple generation stages
When stage indicators are displayed
Then the system should show each stage as a numbered step
And mark completed stages with checkmarks
And highlight the current active stage
And gray out future stages

### Requirement: User Interaction Controls
The system SHALL provide user controls for managing generation tasks.

#### Scenario: Generation Cancellation
Given a generation task is in progress
When user clicks "取消生成" button
Then the system should send cancellation request to backend
And stop progress polling
And display cancellation confirmation
And clean up any partial results

#### Scenario: Progress Pause and Resume
Given a generation task is running
When user temporarily navigates away
Then the system should continue polling in background
And resume display when user returns
And maintain current progress state

### Requirement: Error Handling and Recovery
The system SHALL implement robust error handling for progress tracking.

#### Scenario: Network Interruption Recovery
Given progress polling fails due to network issues
When connection is restored
Then the system should automatically resume polling
And catch up on missed progress updates
And display appropriate connection status

#### Scenario: Task Timeout Handling
Given a generation task exceeds expected time
When timeout occurs
Then the system should display timeout warning
And offer options to continue waiting or cancel
And provide estimated additional time required

## MODIFIED Requirements

### Requirement: Enhanced Backend Status API
The system SHALL modify backend to provide detailed progress information.

#### Scenario: Detailed Status Response
Given a progress polling request is received
When status is queried
Then the backend should return current progress percentage
And include current stage description
And provide overall task status (RUNNING, SUCCESS, FAILED, CANCELLED)
And include any error messages if applicable

#### Scenario: Stage Progress Tracking
Given generation has multiple processing stages
When stage progress is tracked
Then the backend should update progress at each stage boundary
And provide meaningful stage descriptions
And estimate time remaining based on historical data

### Requirement: Improved Frontend State Management
The system SHALL enhance frontend state management for progress tracking.

#### Scenario: Progress State Persistence
Given a user refreshes the page during generation
When the page reloads
Then the system should resume progress polling for active tasks
And restore previous progress state if available
And handle orphaned tasks appropriately

#### Scenario: Multiple Task Progress
Given multiple skeleton generation tasks are running
When progress is displayed
Then the system should track each task independently
And show progress for the currently selected task
And provide task switching capabilities

### Requirement: Performance Optimization
The system SHALL optimize progress polling for performance and user experience.

#### Scenario: Adaptive Polling Frequency
Given varying generation stages
When polling frequency is adjusted
Then the system should use higher frequency for quick stages
And lower frequency for longer stages
And adapt based on remaining time estimates

#### Scenario: Bandwidth Optimization
Given progress polling requests
When bandwidth usage is optimized
Then the system should minimize response payload size
And use efficient data formats
And implement request batching where appropriate

