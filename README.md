# X Simulator

A static, single-page simulator of the X "For You" feed ranking algorithm.

Set an account's follower and following counts, tune how often viewers report, block, mute, or dismiss posts, and run a simulation to see how a candidate feed gets scored, ranked, and suppressed. The Weights tab summarizes the scoring weights used.

Weights are sourced from the published algorithm at [xai-org/x-algorithm](https://github.com/xai-org/x-algorithm) (`home-mixer/params/param.rs`). Engagement probabilities are randomized per run; this is an illustrative model, not a reimplementation.

The UI follows the browser's light/dark preference and auto-detects English or Japanese, with a language picker in the header.

## Run

Open `index.html`, or serve the folder with any static file server. Deployable as-is to GitHub Pages.
