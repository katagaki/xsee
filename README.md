# X Simulator

A static, single-page simulator of the X "For You" feed ranking algorithm.

Set follower, following, and verified follower counts; add account or post visibility flags; tune negative feedback rates; then run a simulation to watch estimated engagement and reach. The Weights tab summarizes the published scoring weights.

Weights were checked against [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm/blob/bf7db1becb6590152fba79b8c3bf0555752f7b14/home-mixer/params/param.rs) at commit `bf7db1b` (September 25, 2026). That update did not change the published scoring defaults. Engagement probabilities and reach are illustrative estimates, not a reimplementation of Phoenix.

The simulator separates follower reach from non-follower recommendations. The flag controls represent recommendation-limiting visibility labels: at least one account or post flag blocks simulated non-follower reach, while follower reach continues. This is a simplified example of X's [visibility filtering](https://github.com/xai-org/x-algorithm/blob/bf7db1becb6590152fba79b8c3bf0555752f7b14/README.md#filtering). Actual label type, viewer context, and policy determine whether a post is shown, warned, or dropped; X does not publish a numeric reach penalty per flag. The latest source adds an Immersive Expanded Recommendations policy and viewer-dependent rules, including sensitive-media preferences and limited engagement. Those contexts are outside this single-post reach estimate. Flag counts do not stack or alter the score. Verified followers are a subset of followers and only affect the estimated verified follower view count. There is no published verified follower ranking multiplier in the cited scorer.

The ranker's author and topic diversity steps are outside this single-post simulation.

The UI follows the browser's light/dark preference and auto-detects English or Japanese, with a language picker in the header.

## Run

Serve the folder with any static file server, for example `python3 -m http.server`. Deployable as-is to GitHub Pages.
