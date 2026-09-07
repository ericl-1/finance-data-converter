# Shared Expenses — Requirements and Implementation

Status: Initial implementation complete; ready for UAT  
Priority: Current destination work

## Confirmed destination contract

Shared Expenses exports these columns in this exact order:

1. Date
2. Paid By
3. Total Amount
4. Description

Date may be blank and is expected to be blank for most records. Paid By may also be blank.

No output column is calculated by the converter. Formulas exist only in the destination workbook and are neither supplied by the source nor generated here.

The converter preserves source order. It does not sort or reverse Shared Expenses rows. Rows from the spreadsheet block are followed by rows from the text-message block.

## Confirmed sources

The initial workflow accepts either or both of these independently pasted blocks:

1. **Spreadsheet paste:** one row per transaction with Total Amount first and Description second. Spreadsheet tab separation is accepted; whitespace separation also works.
2. **Text-message paste:** one transaction per non-empty line with Description followed by Total Amount as the final value.

Neither source normally includes dates, so Date is exported blank. Every non-empty, structurally valid transaction line is included. Descriptions are preserved exactly as supplied.

The user enters one Paid By name for each block and it applies to every transaction parsed from that block. A blank name is valid.

One block of either profile or one block of each profile is supported in a session.

## Validation and duplicates

Amounts are expected to be positive. Negative amounts are retained but flagged for review rather than silently changed.

Rows with the same normalized Description and exact Amount are treated as possible duplicates. Every matching row is highlighted and retained by default. The user decides whether to keep or exclude each one using the standard row-selection controls.

## Initial implementation

The enabled Shared Expenses destination provides:

- two independent paste blocks;
- a free-text Paid By value for each block;
- conversion into the four confirmed output columns;
- blank dates;
- source-order preservation;
- warnings for negative amounts and unreadable lines;
- possible-duplicate highlighting without automatic removal;
- per-row and select-all inclusion controls;
- immediate selected-total recalculation;
- a selected-row count and subtotal for each active paste block, labelled with its Paid By name;
- workbook-ready tab-separated copy without headers; and
- CSV export with explicit headers.

The implementation reuses the application's existing in-memory destination state, review, receipt, copy, CSV, and start-over behavior. Imported values remain browser-session-only.

## UAT questions and possible refinements

These are no longer blockers and should be decided from real workflow testing:

1. Should a future version accept more than one block of either profile?
2. If dates occasionally appear, should they be recognized or continue to be left blank?
3. Should Paid By remain free text or offer saved/configured participant choices?
4. Should optional description cleanup be introduced later?
5. Do real pastes contain headers, totals, or notes that need explicit exclusion rules?
6. Should a negative amount eventually block export rather than remain a warning?
7. Is month selection useful, or should all added rows remain together?

## Current safe boundary

The transformation is enabled only for the two confirmed paste profiles. It does not infer dates, clean descriptions, calculate workbook fields, automatically remove duplicates, or accept arbitrary source structures.

Real financial exports, workbook contents, and private screenshots must not be committed. Automated fixtures should use synthetic names and amounts.
