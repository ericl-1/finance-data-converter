const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadConverter() {
  const ConverterCore = require('../converter-core.js');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(inline, 'Expected the application inline script');
  const setupMarker = "document.querySelectorAll('[data-dest]').forEach(btn=>btn.onclick=()=>{destination=";
  const coreScript = inline.slice(0, inline.indexOf(setupMarker));
  assert.ok(coreScript.length < inline.length, 'Expected to find the browser setup marker');

  const context = { console, Intl, TextDecoder, URL, Blob, setTimeout, clearTimeout, ConverterCore };
  vm.createContext(context);
  vm.runInContext(`${coreScript}\n;globalThis.testApi={
    convert(destinationKey,text,name='Synthetic source'){
      destination=destinationKey;source=parseSourceText(text,name);converted=[];issues=[];findings=[];detected=null;excluded=0;duplicateCount=0;accounting=null;selectedMonth='';expenseAll=[];expenseMonths=[];expenseExcludedByMonth={};
      if(source)detectAndConvert();
      return this.snapshot();
    },
    selectExpenseMonth(month){selectedMonth=month;converted=expenseAll.filter(r=>r.month===month);excluded=expenseExcludedByMonth[month]||0;return this.snapshot()},
    convertShared(blocks){destination='shared';sharedBlocks=blocks;excluded=0;duplicateCount=0;const result=buildSharedConversion(blocks);converted=result.rows;issues=result.issues;findings=result.findings;sharedDuplicateCount=result.possibleDuplicates;applyAccounting(result.accounting);source={headers:['Total Amount','Description'],rows:converted.map(r=>[r.amount,r.details]),name:'Shared Expenses pasted blocks',format:'shared-pastes'};detected=converted.length?{kind:'shared',label:'Shared Expenses'}:null;return this.snapshot()},
    select(index,value){converted[index].selected=value;return this.snapshot()},
    edit(index,changes){const result=applyRowEdit(converted[index],changes,destination);if(result.ok)refreshSharedDuplicates();return {result:JSON.parse(JSON.stringify(result)),snapshot:this.snapshot()}},
    snapshot(){return JSON.parse(JSON.stringify({detected,converted,issues,findings,excluded,duplicateCount,accounting,sharedDuplicateCount,expenseMonths,csv:detected?csv():'',workbookRows:detected?workbookRows():'',totals:totals()}))}
  };`, context);
  const api = context.testApi;
  const normalize = value => JSON.parse(JSON.stringify(value));
  return {
    convert: (...args) => normalize(api.convert(...args)),
    selectExpenseMonth: (...args) => normalize(api.selectExpenseMonth(...args)),
    convertShared: (...args) => normalize(api.convertShared(...args)),
    select: (...args) => normalize(api.select(...args)),
    edit: (...args) => normalize(api.edit(...args))
  };
}

test('release version is consistent across application metadata', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const packageMetadata = require('../package.json');

  assert.match(html, />v0\.11\.0 Beta<\/div>/);
  assert.match(readme, /`v0\.11\.0 Beta`/);
  assert.equal(packageMetadata.version, '0.11.0-beta.0');
});

test('Budget Tracker converts split money columns and preserves source order', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date\tDescription\tWithdrawals\tDeposits',
    '2026-01-05\tSample purchase\t12.34\t',
    '2026-01-15\tSample deposit\t\t500.00'
  ].join('\n'));

  assert.equal(result.detected.kind, 'split');
  assert.deepEqual(result.converted.map(row => [row.date, row.details, row.amount, row.type]), [
    ['2026-01-05', 'Sample purchase', 12.34, 'Money Out'],
    ['2026-01-15', 'Sample deposit', 500, 'Money In']
  ]);
  assert.equal(result.workbookRows, '2026-01-05\tSample purchase\t12.34\r\n2026-01-15\tSample deposit\t500.00');
  assert.equal(result.csv, 'Date,Details,Amount\r\n2026-01-05,Sample purchase,12.34\r\n2026-01-15,Sample deposit,500.00');
});

test('canonical transactions retain provenance, signed amounts, and review metadata', () => {
  const core = require('../converter-core.js');
  const source = core.parseSourceText([
    'Date\tDescription\tWithdrawals\tDeposits',
    '2026-01-05\tSample purchase\t12.34\t'
  ].join('\n'), 'synthetic-td.tsv');
  const result = core.convertParsedSource('budget', source);
  const transaction = result.transactions[0];

  assert.deepEqual(transaction, {
    date: '2026-01-05',
    rawDescription: 'Sample purchase',
    normalizedDescription: 'Sample purchase',
    amountSigned: -12.34,
    direction: 'Money Out',
    sourceProfile: 'generic-split',
    sourceFile: 'synthetic-td.tsv',
    sourceRow: 1,
    status: 'ready',
    warnings: [],
    metadata: {}
  });
});

test('merchant normalization is conservative and preserves original descriptions', () => {
  const core = require('../converter-core.js');
  const generic = core.canonicalTransaction({
    rawDescription: 'MERCHANT   WITH   SPACES',
    amountSigned: -10,
    direction: 'Money Out',
    sourceProfile: 'generic-signed'
  });
  const expense = core.canonicalTransaction({
    rawDescription: 'Amazon.ca*5N6EW68O2   OTTAWA ON',
    amountSigned: -30.03,
    direction: 'Money Out',
    sourceProfile: 'tangerine-world-mc'
  });

  assert.equal(generic.rawDescription, 'MERCHANT   WITH   SPACES');
  assert.equal(generic.normalizedDescription, 'MERCHANT WITH SPACES');
  assert.equal(expense.rawDescription, 'Amazon.ca*5N6EW68O2   OTTAWA ON');
  assert.equal(expense.normalizedDescription, 'Amazon.ca*5N6EW68O2');
  assert.equal(core.normalizeDescription('SHOP UNKNOWNVILLE ON', 'tangerine-world-mc'), 'SHOP UNKNOWNVILLE ON');
});

test('normalized descriptions are used in output and duplicate comparison', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Withdrawal',
    '2026-01-05,"  MERCHANT   NAME  ",12.34',
    '2026-01-05,MERCHANT NAME,12.34'
  ].join('\n'));

  assert.deepEqual(result.converted.map(row => row.details), ['MERCHANT NAME', 'MERCHANT NAME']);
  assert.equal(result.converted[0].canonical.rawDescription, '  MERCHANT   NAME  ');
  assert.deepEqual(result.converted.map(row => row.duplicate), [true, true]);
});

test('TD headerless activity is recognized without treating its first row as headers', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    '01/05/2026\tPurchase one\t10.00\t\t990.00',
    '01/06/2026\tDeposit one\t\t25.00\t1015.00'
  ].join('\n'));

  assert.equal(result.detected.label, 'TD account activity · headerless 5-column export');
  assert.equal(result.converted.length, 2);
  assert.deepEqual(result.converted.map(row => row.details), ['Purchase one', 'Deposit one']);
});

test('Desjardins headerless chequing retains descriptions and money direction', () => {
  const app = loadConverter();
  const row = (date, description, withdrawal, deposit, balance) => [
    'Bank', 'Account', 'Code', date, 'Sequence', description, '', withdrawal, deposit, '', '', '', '', balance
  ].join('\t');
  const result = app.convert('budget', [
    row('2026-02-01', 'Synthetic café purchase', '15.75', '', '984.25'),
    row('2026-02-02', 'Synthetic deposit', '', '100.00', '1084.25')
  ].join('\n'));

  assert.equal(result.detected.label, 'Desjardins chequing · headerless 14-column export');
  assert.deepEqual(result.converted.map(item => [item.details, item.type]), [
    ['Synthetic café purchase', 'Money Out'],
    ['Synthetic deposit', 'Money In']
  ]);
});

test('Budget Tracker supports a generic signed amount profile', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Amount',
    '2026-03-01,Synthetic withdrawal,-12.50',
    '2026-03-02,Synthetic deposit,40.00'
  ].join('\n'));

  assert.equal(result.detected.kind, 'signed');
  assert.deepEqual(result.converted.map(item => [item.amount, item.type]), [
    [12.5, 'Money Out'],
    [40, 'Money In']
  ]);
});

test('Budget Tracker supports money-out-only columns', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Withdrawal',
    '2026-03-03,"Coffee, snacks",12.34'
  ].join('\n'));

  assert.equal(result.detected.kind, 'out');
  assert.deepEqual(result.converted.map(item => [item.details, item.amount, item.type]), [
    ['Coffee, snacks', 12.34, 'Money Out']
  ]);
});

test('Budget Tracker supports money-in-only columns', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Deposit',
    '2026-03-04,Synthetic reimbursement,"1,234.56"'
  ].join('\n'));

  assert.equal(result.detected.kind, 'in');
  assert.deepEqual(result.converted.map(item => [item.amount, item.type]), [
    [1234.56, 'Money In']
  ]);
});

test('currency parsing distinguishes decimal commas from thousands separators', () => {
  const core = require('../converter-core.js');

  assert.equal(core.cleanNum('18,25'), 18.25);
  assert.equal(core.cleanNum('1,234'), 1234);
  assert.equal(core.cleanNum('1,234.56'), 1234.56);
  assert.equal(core.cleanNum('1.234,56'), 1234.56);
  assert.equal(core.cleanNum('(1,234.56)'), -1234.56);
});

test('zero amounts remain usable with a soft review warning', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Withdrawal',
    '2026-03-05,Synthetic zero,0.00'
  ].join('\n'));

  assert.equal(result.converted.length, 1);
  assert.equal(result.converted[0].amount, 0);
  assert.deepEqual(result.findings.map(finding => finding.kind), ['review']);
  assert.match(result.issues[0], /zero amount/);
});

test('unexpected source row widths are reported without blocking usable rows', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Withdrawal',
    '2026-03-05,Synthetic purchase,12.00,unexpected'
  ].join('\n'));

  assert.equal(result.converted.length, 1);
  assert.match(result.issues.join('\n'), /4 columns; expected 3/);
  assert.ok(result.findings.some(finding => finding.kind === 'review'));
});

test('ambiguous comma amounts are parsed as thousands with review guidance', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date\tDescription\tWithdrawal',
    '2026-03-05\tSynthetic purchase\t1,234'
  ].join('\n'));

  assert.equal(result.converted[0].amount, 1234);
  assert.match(result.issues.join('\n'), /interpreted comma as a thousands separator/);
  assert.ok(result.findings.some(finding => finding.kind === 'review'));
});

test('matching converted transactions are flagged as possible duplicates and retained', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Description,Withdrawal',
    '2026-03-05,Same merchant,12.00',
    '2026-03-05,Same merchant,12.00',
    '2026-03-06,Same merchant,12.00'
  ].join('\n'));

  assert.equal(result.converted.length, 3);
  assert.equal(result.sharedDuplicateCount, 2);
  assert.deepEqual(result.converted.map(row => row.duplicate), [true, true, false]);
  assert.match(result.issues.join('\n'), /Possible duplicate group 1/);
});

test('ambiguous generic headers are reported while the selected mapping remains usable', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date,Posted Date,Description,Withdrawal',
    '2026-03-05,2026-03-06,Synthetic purchase,12.00'
  ].join('\n'));

  assert.equal(result.converted.length, 1);
  assert.equal(result.converted[0].date, '2026-03-05');
  assert.match(result.issues.join('\n'), /multiple possible date columns; used “Date”/);
  assert.ok(result.findings.some(finding => finding.kind === 'review'));
});

test('Savings signed amounts split into Money In and Money Out output columns', () => {
  const app = loadConverter();
  const result = app.convert('savings', [
    'Date\tTransaction\tName\tMemo\tAmount',
    '01/05/2026\tOTHER\tSample deposit\tIgnored memo\t25.00',
    '01/12/2026\tOTHER\tSample withdrawal\tIgnored memo\t-10.00'
  ].join('\n'));

  assert.equal(result.detected.kind, 'signed');
  assert.equal(result.workbookRows, '2026-01-05\t25.00\t\tSample deposit\t\r\n2026-01-12\t\t10.00\tSample withdrawal\t');
  assert.equal(result.totals.in, 25);
  assert.equal(result.totals.out, 10);
});

test('Savings recognizes pasted French split columns', () => {
  const app = loadConverter();
  const result = app.convert('savings', [
    'Date\tDescriptif\tRetrait\tDepot',
    '1 mars 2026\tAchat synthétique\t18,25\t',
    '2 mars 2026\tDépôt synthétique\t\t75,00'
  ].join('\n'));

  assert.equal(result.detected.label, 'Desjardins Savings · pasted French statement');
  assert.deepEqual(result.converted.map(item => [item.date, item.amount, item.type]), [
    ['2026-03-01', 18.25, 'Money Out'],
    ['2026-03-02', 75, 'Money In']
  ]);
});

test('Expense Calculator excludes positive rows and preserves reversed purchase order', () => {
  const app = loadConverter();
  app.convert('expense', [
    'Transaction date,Transaction,Name,Memo,Amount',
    '01/01/2026,DEBIT,FIRST SHOP,, -10.00',
    '01/02/2026,CREDIT,SAMPLE PAYMENT,,20.00',
    '01/03/2026,DEBIT,SECOND SHOP,, -30.00'
  ].join('\n'));
  const result = app.selectExpenseMonth('2026-01');

  assert.deepEqual(result.expenseMonths, ['2026-01']);
  assert.equal(result.excluded, 1);
  assert.deepEqual(result.converted.map(row => row.details), ['Tangerine MC (SECOND SHOP)', 'Tangerine MC (FIRST SHOP)']);
  assert.equal(result.csv, 'Description,Amount\r\nTangerine MC (SECOND SHOP),30.00\r\nTangerine MC (FIRST SHOP),10.00');
});

test('Expense Calculator removes exact duplicates across files but retains repeats within a file', () => {
  const core = require('../converter-core.js');
  const header = 'Transaction date,Transaction,Name,Memo,Amount';
  const repeated = '01/01/2026,DEBIT,SAME SHOP,,-10.00';
  const first = core.parseSourceText([header, repeated, repeated].join('\n'), 'first.csv');
  const second = core.parseSourceText([header, repeated, '01/02/2026,DEBIT,OTHER SHOP,,-20.00'].join('\n'), 'second.csv');
  const result = core.combineExpenseSources([
    { name: 'first.csv', parsed: first },
    { name: 'second.csv', parsed: second }
  ]);

  assert.equal(result.duplicateCount, 1);
  assert.equal(result.source.rows.length, 3);
  assert.equal(result.source.name, 'first.csv, second.csv');
  assert.equal(result.source.rows.filter(row => row[2] === 'SAME SHOP').length, 2);
});

test('Expense Calculator flags equivalent converted rows with different source-only fields', () => {
  const app = loadConverter();
  app.convert('expense', [
    'Transaction date,Transaction,Name,Memo,Amount',
    '01/01/2026,DEBIT,SAME SHOP,first memo,-10.00',
    '01/01/2026,DEBIT,SAME SHOP,second memo,-10.00'
  ].join('\n'));
  const result = app.selectExpenseMonth('2026-01');

  assert.equal(result.converted.length, 2);
  assert.equal(result.sharedDuplicateCount, 2);
  assert.deepEqual(result.converted.map(row => row.duplicate), [true, true]);
});

test('Shared Expenses combines both blocks, assigns payers, and preserves block order', () => {
  const app = loadConverter();
  const result = app.convertShared([
    { payer: 'Alex', text: '$30.03\tTangerine MC (Amazon)\n$47.88\tTangerine MC (Uber)' },
    { payer: 'Fawn', text: 'Pizza 68.04\nGroceries 21.05' }
  ]);

  assert.deepEqual(result.converted.map(row => [row.date, row.payer, row.amount, row.details]), [
    ['', 'Alex', 30.03, 'Tangerine MC (Amazon)'],
    ['', 'Alex', 47.88, 'Tangerine MC (Uber)'],
    ['', 'Fawn', 68.04, 'Pizza'],
    ['', 'Fawn', 21.05, 'Groceries']
  ]);
  assert.equal(result.workbookRows, '\tAlex\t30.03\tTangerine MC (Amazon)\r\n\tAlex\t47.88\tTangerine MC (Uber)\r\n\tFawn\t68.04\tPizza\r\n\tFawn\t21.05\tGroceries');
  assert.equal(result.csv.split('\r\n')[0], 'Date,Paid By,Total Amount,Description');
});

test('Shared Expenses flags duplicates and negative amounts without removing rows', () => {
  const app = loadConverter();
  const result = app.convertShared([
    { payer: 'Alex', text: '$10.00\tSame merchant' },
    { payer: 'Fawn', text: 'Same merchant 10.00\nUnexpected refund -5.00' }
  ]);

  assert.equal(result.converted.length, 3);
  assert.equal(result.sharedDuplicateCount, 2);
  assert.deepEqual(result.converted.map(row => row.duplicate), [true, true, false]);
  assert.match(result.issues.join('\n'), /negative amount -5\.00/);
  assert.match(result.issues.join('\n'), /Possible duplicate group 1/);
});

test('Shared Expenses retains zero amounts with a review warning', () => {
  const app = loadConverter();
  const result = app.convertShared([
    { payer: 'Alex', text: '$0.00\tPending adjustment' },
    { payer: '', text: '' }
  ]);

  assert.equal(result.converted.length, 1);
  assert.equal(result.converted[0].amount, 0);
  assert.match(result.issues.join('\n'), /zero amount/);
  assert.ok(result.findings.some(finding => finding.kind === 'review'));
});

test('row exclusion changes Shared Expenses exports and reconciliation totals', () => {
  const app = loadConverter();
  app.convertShared([
    { payer: 'Alex', text: '$30.00\tFirst item\n$20.00\tSecond item' },
    { payer: 'Fawn', text: 'Third item 10.00' }
  ]);
  const result = app.select(1, false);

  assert.equal(result.converted.filter(row => row.selected !== false).length, 2);
  assert.equal(result.totals.out, 40);
  assert.doesNotMatch(result.workbookRows, /Second item/);
});

test('session edits update workbook output and preserve original values', () => {
  const app = loadConverter();
  app.convert('budget', [
    'Date,Description,Withdrawal,Deposit',
    '2026-01-05,Original merchant,12.34,'
  ].join('\n'));
  const { result, snapshot } = app.edit(0, {
    date: '2026-01-06',
    details: 'Corrected merchant',
    amount: '15.25',
    type: 'Money In'
  });

  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.equal(snapshot.workbookRows, '2026-01-06\tCorrected merchant\t15.25');
  assert.equal(snapshot.converted[0].edited, true);
  assert.deepEqual(snapshot.converted[0].editedFields, ['date', 'details', 'amount', 'type']);
  assert.deepEqual(snapshot.converted[0].originalOutput, {
    date: '2026-01-05',
    details: 'Original merchant',
    amount: 12.34,
    type: 'Money Out'
  });
  assert.equal(snapshot.converted[0].canonical.rawDescription, 'Original merchant');
  assert.equal(snapshot.converted[0].canonical.amountSigned, 15.25);
});

test('invalid session edit amounts are rejected without changing the row', () => {
  const app = loadConverter();
  app.convertShared([
    { payer: 'Alex', text: '$10.00\tOriginal merchant' },
    { payer: '', text: '' }
  ]);
  const { result, snapshot } = app.edit(0, { amount: 'not an amount' });

  assert.equal(result.ok, false);
  assert.equal(snapshot.converted[0].amount, 10);
  assert.equal(snapshot.converted[0].edited, undefined);
});

test('editing Shared Expenses recalculates possible duplicate flags', () => {
  const app = loadConverter();
  app.convertShared([
    { payer: 'Alex', text: '$10.00\tSame merchant' },
    { payer: 'Fawn', text: 'Same merchant 10.00' }
  ]);
  const { snapshot } = app.edit(1, { details: 'Different merchant' });

  assert.equal(snapshot.sharedDuplicateCount, 0);
  assert.deepEqual(snapshot.converted.map(row => row.duplicate), [false, false]);
  assert.equal(snapshot.converted[1].canonical.direction, 'Money Out');
  assert.equal(snapshot.converted[1].canonical.amountSigned, 10);
});

test('missing dates are review notes while valid rows remain exportable', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date\tDescription\tWithdrawals\tDeposits',
    '\tUndated purchase\t12.00\t'
  ].join('\n'));

  assert.equal(result.converted.length, 1);
  assert.equal(result.workbookRows, '\tUndated purchase\t12.00');
  assert.deepEqual(result.findings.map(finding => finding.kind), ['review']);
});

test('malformed rows are skipped without discarding valid output', () => {
  const app = loadConverter();
  const result = app.convert('budget', [
    'Date\tDescription\tWithdrawals\tDeposits',
    '2026-01-01\tConflicting row\t10.00\t20.00',
    '2026-01-02\tValid row\t5.00\t'
  ].join('\n'));

  assert.equal(result.converted.length, 1);
  assert.match(result.workbookRows, /Valid row/);
  assert.deepEqual(result.findings.map(finding => finding.kind), ['skipped']);
  assert.deepEqual(result.accounting, {
    sourceRows: 2,
    converted: 1,
    sourceExcluded: 0,
    skipped: 1,
    deduplicated: 0,
    accounted: 2,
    reconciled: true
  });
});

test('Expense Calculator accounting covers all months before month selection', () => {
  const app = loadConverter();
  const result = app.convert('expense', [
    'Transaction date,Transaction,Name,Memo,Amount',
    '01/01/2026,DEBIT,FIRST SHOP,,-10.00',
    '01/02/2026,CREDIT,SAMPLE PAYMENT,,20.00',
    '02/03/2026,DEBIT,SECOND SHOP,,-30.00',
    '02/04/2026,DEBIT,BROKEN SHOP,,not-an-amount'
  ].join('\n'));

  assert.deepEqual(result.accounting, {
    sourceRows: 4,
    converted: 2,
    sourceExcluded: 1,
    skipped: 1,
    deduplicated: 0,
    accounted: 4,
    reconciled: true
  });
});

test('Shared Expenses accounting includes malformed non-empty paste lines', () => {
  const app = loadConverter();
  const result = app.convertShared([
    { payer: 'Alex', text: '$10.00\tValid merchant\nUnreadable line' },
    { payer: '', text: '' }
  ]);

  assert.equal(result.converted.length, 1);
  assert.equal(result.accounting.sourceRows, 2);
  assert.equal(result.accounting.skipped, 1);
  assert.equal(result.accounting.reconciled, true);
});

test('unsupported columns fail without producing converted rows', () => {
  const app = loadConverter();
  const result = app.convert('budget', 'Unknown\tOther\nabc\t123');

  assert.equal(result.detected, null);
  assert.equal(result.converted.length, 0);
  assert.match(result.issues[0], /Date and Details\/Description/);
  assert.deepEqual(result.findings.map(finding => finding.kind), ['no-output']);
});
