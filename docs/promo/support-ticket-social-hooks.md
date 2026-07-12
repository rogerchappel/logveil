# Support Ticket Social Hooks

Grounded source files:

- `examples/support-ticket.log`
- `demo/sanitize-support-ticket.sh`
- `docs/tutorials/sanitize-support-ticket.md`

## Short hooks

- "The fastest repro bundle is often a support ticket. The unsafe part is everything around it."
- "LogVeil turns a ticket log into Markdown plus redaction evidence before it leaves your laptop."
- "A good sanitizer should keep the failure and remove the customer-shaped details."

## Demo angle

Open the synthetic support-ticket fixture, run
`bash demo/sanitize-support-ticket.sh`, then compare the raw log with the
sanitized Markdown report.

## Limitations to say out loud

- LogVeil is an MVP sanitizer, not a complete DLP system.
- Review sanitized bundles before publishing them.
- Project-specific sensitive patterns may need additional rules.
