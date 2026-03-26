# Spec: Frontend Results Display and Download for Skeleton Assets

## ADDED Requirements

### Requirement: Skeleton Results Panel
The system SHALL create a dedicated results panel for displaying skeleton asset generation results.

#### Scenario: Full Image Preview
Given skeleton generation is complete
When the results panel is displayed
Then the system should show the full-body image prominently
And provide a download button for the complete image
And display image dimensions and file size

#### Scenario: Individual Part Grid
Given multiple skeleton parts are generated
When the parts grid is displayed
Then the system should show each part in a separate preview card
And display the part name in Chinese (头部, 躯干, 左臂, etc.)
And provide individual download buttons for each part

### Requirement: Batch Download Functionality
The system SHALL implement batch download capabilities for skeleton parts.

#### Scenario: ZIP Archive Download
Given all skeleton parts are ready
When user clicks "批量下载" button
Then the system should create a ZIP archive containing all parts
And include the full-body image in the archive
And use descriptive filenames (skeleton_head.png, skeleton_torso.png, etc.)

#### Scenario: Download Progress Indication
Given a large ZIP file is being created
When download is in progress
Then the system should show download progress
And prevent multiple simultaneous downloads
And handle network errors gracefully

### Requirement: Part Preview and Interaction
The system SHALL enable interactive preview of skeleton parts.

#### Scenario: Hover Preview Enhancement
Given a part preview card
When user hovers over the card
Then the system should highlight the part
And show a larger preview in a tooltip
And display part-specific information (dimensions, file size)

#### Scenario: Part Reordering
Given multiple skeleton parts are displayed
When user drags a part to reorder
Then the system should update the display order
And maintain the new order during the session
And provide visual feedback during drag operations

### Requirement: Quality Indicators
The system SHALL display quality and status information for generated parts.

#### Scenario: Segmentation Quality Display
Given parts with different segmentation quality
When quality indicators are shown
Then the system should display quality badges (High/Medium/Basic)
And provide tooltips explaining quality levels
And suggest improvements for low-quality parts

#### Scenario: File Information Display
Given a skeleton part is ready for download
When file information is displayed
Then the system should show file size, dimensions, and format
And indicate if the file has transparency
And provide last modified timestamp

## MODIFIED Requirements

### Requirement: Enhanced Portrait Store
The system SHALL modify portraitStore.ts to handle skeleton results and download states.

#### Scenario: Skeleton Results Management
Given skeleton generation is complete
When results are received from the API
Then the store should parse and validate the response
And update skeletonResults with the new data
And trigger UI updates for the results panel

#### Scenario: Download State Management
Given multiple download operations are in progress
When download state is managed
Then the store should track which files are being downloaded
And prevent duplicate downloads
And handle download errors appropriately

### Requirement: Improved Error Handling
The system SHALL enhance error handling for result display and download operations.

#### Scenario: Network Error Recovery
Given a download fails due to network issues
When error recovery is attempted
Then the system should retry the download automatically
And show user-friendly error messages
And provide manual retry options

#### Scenario: Invalid File Handling
Given a corrupted or invalid skeleton part file
When file validation fails
Then the system should display error indicators
And offer to regenerate the specific part
And log the error for debugging

