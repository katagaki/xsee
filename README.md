# X Simulator

A static, single-page simulator of the X "For You" feed ranking algorithm.

Set follower, following, and verified follower counts; add account or post visibility flags; tune negative feedback rates; then run a simulation to watch estimated engagement and reach. The Weights tab summarizes the published scoring weights.

Weights are sourced from [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm/blob/44d37ebf87f2185b949cd37b710d410c2a77d21f/home-mixer/params/param.rs) at commit `44d37eb` (September 24, 2026). Engagement probabilities and reach are illustrative estimates, not a reimplementation of Phoenix.

The simulator separates follower reach from non-follower recommendations. The flag controls represent recommendation-limiting visibility labels: at least one account or post flag blocks simulated non-follower reach, while follower reach continues. This is a simplified example of X's [visibility filtering](https://github.com/xai-org/x-algorithm/blob/44d37ebf87f2185b949cd37b710d410c2a77d21f/README.md#filtering). Actual label type, viewer context, and policy determine whether a post is shown, warned, or dropped; X does not publish a numeric reach penalty per flag. Flag counts do not stack or alter the score. Verified followers are a subset of followers and only affect the estimated verified follower view count. There is no published verified follower ranking multiplier in the cited scorer.

The ranker's author and topic diversity steps are outside this single-post simulation.

The UI follows the browser's light/dark preference and auto-detects English or Japanese, with a language picker in the header.

## Run

Serve the folder with any static file server, for example `python3 -m http.server`. Deployable as-is to GitHub Pages.
