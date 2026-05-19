# Mandate demo — 5-second scaffold + validation
#
# Run:
#   vhs docs/assets/demo.tape
# Outputs: docs/assets/demo.gif
#
# Requirements:
#   - vhs (brew install vhs)
#   - https://github.com/charmbracelet/vhs
#
# Tweak Width/Height/FontSize/Theme as you like — defaults below
# are tuned for README hero placement.

Output docs/assets/demo.gif

Set Shell bash
Set FontSize 16
Set Width 1100
Set Height 620
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 50ms
Set PlaybackSpeed 1.0

# Cold open — bare prompt
Type "# Mandate · 天命 — scaffold a Chinese imperial court for any task"
Sleep 1s
Enter
Type "# 1) scaffold"
Enter
Sleep 500ms

# Scaffold command
Type "npx --yes create-mandate@alpha my-empire --template both"
Sleep 500ms
Enter
Sleep 4s

# Inspect the constitution
Type "# 2) inspect the constitution"
Enter
Sleep 300ms
Type "cd my-empire && cat .mandate/constitution/constitution.yaml | head -25"
Enter
Sleep 3s

# Validate
Type "# 3) validate"
Enter
Sleep 300ms
Type "npx --yes -p @mandateai/cli@alpha mandate validate ."
Enter
Sleep 4s

# Closing breath
Sleep 1s
Type "# zero LLM calls — full court ready in 5s"
Sleep 2s
