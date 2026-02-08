---
name: OpenSpec: Proposal
description: Scaffold a new OpenSpec change and validate strictly.
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
**Guardrails**
- .md文件里所有内容除了需要强校验的关键字，其他的都用中文！！！
- 注意proposal.md是这种格式的"## Why\n...\n\n## What Changes\n- ...\n\n## Impact\n- ...\n"，要严格遵守。
- ## Impact部分，内容是：本次变更影响哪些文件。格式是：Affected specs: [list capabilities], Affected code: [key files/systems]
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.
- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents (proposal.md, tasks.md, design.md, and spec deltas). Implementation happens in the apply stage after approval.

**Steps**
1. Review `openspec/project.md`, run `openspec list` and `openspec list --specs`, and inspect related code or docs (e.g., via `rg`/`ls`) to ground the proposal in current behaviour; note any gaps that require clarification.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, and `design.md`
   under `openspec/changes/<id>/`。其中`tasks.md`要严格遵守：每个子任务前面有[ ]这个符号，这样才知道进度。
3. Map the change into concrete capabilities or requirements, breaking multi-scope efforts into distinct spec deltas with clear relationships and sequencing.
4. Capture architectural reasoning in `design.md` when the solution spans multiple systems, introduces new patterns, or demands trade-off discussion before committing to specs.
   design.md文件里要写入详细的代码，给我拿来review！！！
5. 将用户在对话框最原版输入的prompt记录到`promopt.md`中，不需要任何加工，直接记录就可以了（以后可以追溯）。
6. Draft spec deltas in `changes/<id>/specs/<capability>/spec.md` (one folder per capability) using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement and cross-reference related capabilities when relevant.
6. Draft `tasks.md` as an ordered list of small, verifiable work items that deliver user-visible progress, include validation (tests, tooling), and highlight dependencies or parallelizable work.
7. Validate with `openspec validate <id> --strict` and resolve every issue before sharing the proposal.

**Reference**
- Use `openspec show <id> --json --deltas-only` or `openspec show <spec> --type spec` to inspect details when validation fails.
- Search existing requirements with `rg -n "Requirement:|Scenario:" openspec/specs` before writing new ones.(这个命令如果执行成功了，提示一下你成功读取了，如果没成功，也提示一下)
- Explore the codebase with `rg <keyword>`, `ls`, or direct file reads so proposals align with current implementation realities.
<!-- OPENSPEC:END -->
