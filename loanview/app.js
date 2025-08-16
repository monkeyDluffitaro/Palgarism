const routes = [
	"dashboard",
	"apply",
	"detailed",
	"view-applications",
	"compare",
	"rates",
	"report",
];

const el = (id) => document.getElementById(id);

function showToast(message, type = "success") {
	const toast = el("toast");
	toast.textContent = message;
	toast.classList.remove("hidden", "error", "success");
	toast.classList.add(type === "error" ? "error" : "success");
	setTimeout(() => toast.classList.add("hidden"), 2600);
}

function formatINR(num) {
	try {
		return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(num || 0));
	} catch {
		return `₹${Number(num || 0).toLocaleString("en-IN")}`;
	}
}

function navigate(route) {
	routes.forEach((r) => {
		const section = document.getElementById(`route-${r}`);
		section?.classList.remove("visible");
		const btn = document.querySelector(`.nav-item[data-route='${r}']`);
		btn?.classList.remove("active");
	});
	const next = document.getElementById(`route-${route}`);
	next?.classList.add("visible");
	const btn = document.querySelector(`.nav-item[data-route='${route}']`);
	btn?.classList.add("active");
	const titleMap = {
		dashboard: "Loan Dashboard",
		apply: "Select Loan Type",
		detailed: "Loan Application Details",
		"view-applications": "View Applications",
		compare: "Compare Loan Options",
		rates: "Current Interest Rates",
		report: "Generate Loan Report",
	};
	el("pageTitle").textContent = titleMap[route] || "LoanView";
	if (route === "view-applications") renderApplications();
	if (route === "compare") renderCompare();
	if (route === "rates") renderRates();
	if (route === "report") renderReport();
	location.hash = route;
}

// Sidebar navigation
Array.from(document.querySelectorAll(".nav-item")).forEach((btn) => {
	btn.addEventListener("click", () => navigate(btn.dataset.route));
});

// Theme toggle (simple icon swap)
el("themeToggle").addEventListener("click", () => {
	document.body.classList.toggle("light");
	el("themeToggle").innerHTML = document.body.classList.contains("light") ? '<i class="ti ti-moon"></i>' : '<i class="ti ti-sun"></i>';
});

// Sample data
const loanTypes = [
	{ key: "home", name: "Home Loan", icon: "ti ti-home", rate: 8.5, maxTenure: 360, maxAmount: 7500000 },
	{ key: "personal", name: "Personal Loan", icon: "ti ti-user", rate: 11.2, maxTenure: 60, maxAmount: 1000000 },
	{ key: "education", name: "Education Loan", icon: "ti ti-school", rate: 9.0, maxTenure: 180, maxAmount: 4000000 },
	{ key: "vehicle", name: "Vehicle Loan", icon: "ti ti-car", rate: 9.5, maxTenure: 84, maxAmount: 2000000 },
	{ key: "business", name: "Business Loan", icon: "ti ti-businessplan", rate: 12.5, maxTenure: 120, maxAmount: 10000000 },
	{ key: "gold", name: "Gold Loan", icon: "ti ti-diamond", rate: 7.0, maxTenure: 36, maxAmount: 5000000 },
];

const bankOfferings = [
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Home Loan", rate: 8.6 },
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Personal Loan", rate: 11.15 },
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Vehicle Loan", rate: 8.85 },
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Education Loan", rate: 9.2 },
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Business Loan", rate: 12.0 },
	{ bank: "State Bank of India", category: "Public Sector", loanType: "Gold Loan", rate: 7.5 },
	{ bank: "HDFC Bank", category: "Private", loanType: "Home Loan", rate: 8.7 },
	{ bank: "HDFC Bank", category: "Private", loanType: "Personal Loan", rate: 11.0 },
	{ bank: "ICICI Bank", category: "Private", loanType: "Vehicle Loan", rate: 9.1 },
	{ bank: "Axis Bank", category: "Private", loanType: "Education Loan", rate: 9.3 },
];

// Populate selectors
(function initSelectors() {
	const loanSelect = el("applyLoanType");
	loanTypes.forEach((lt) => {
		const opt = document.createElement("option");
		opt.value = lt.key;
		opt.textContent = lt.name;
		loanSelect.appendChild(opt);
	});
	const dashLoanType = el("dashboardLoanType");
	loanTypes.forEach((lt) => {
		const opt = document.createElement("option");
		opt.value = lt.name;
		opt.textContent = lt.name;
		dashLoanType.appendChild(opt);
	});
	const dashBank = el("dashboardBank");
	[...new Set(bankOfferings.map((b) => b.bank))].forEach((b) => {
		const opt = document.createElement("option");
		opt.value = b;
		opt.textContent = b;
		dashBank.appendChild(opt);
	});
	const dashCategory = el("dashboardCategory");
	[...new Set(bankOfferings.map((b) => b.category))].forEach((c) => {
		const opt = document.createElement("option");
		opt.value = c;
		opt.textContent = c;
		dashCategory.appendChild(opt);
	});
})();

// Dashboard offerings render
function renderOfferings() {
	const tbody = document.querySelector("#offeringsTable tbody");
	tbody.innerHTML = "";
	const q = (el("dashboardSearch").value || "").toLowerCase();
	const bank = el("dashboardBank").value;
	const type = el("dashboardLoanType").value;
	const category = el("dashboardCategory").value;
	const min = parseFloat(el("dashboardMinRate").value);
	const max = parseFloat(el("dashboardMaxRate").value);
	const filtered = bankOfferings.filter((o) => {
		const matchesQ = `${o.bank} ${o.loanType}`.toLowerCase().includes(q);
		const matchesBank = bank === "all" || o.bank === bank;
		const matchesCat = category === "all" || o.category === category;
		const matchesType = type === "all" || o.loanType === type;
		const matchesMin = isNaN(min) || o.rate >= min;
		const matchesMax = isNaN(max) || o.rate <= max;
		return matchesQ && matchesBank && matchesCat && matchesType && matchesMin && matchesMax;
	});
	filtered.forEach((o) => {
		const tr = document.createElement("tr");
		const rateClass = o.rate >= 11 ? "rate-high" : "";
		tr.innerHTML = `<td>${o.bank}</td><td>${o.loanType}</td><td class='${rateClass}'>${o.rate.toFixed(2)}%</td><td><i class='ti ti-info-circle'></i></td>`;
		tbody.appendChild(tr);
	});
}
["dashboardSearch", "dashboardBank", "dashboardLoanType", "dashboardCategory", "dashboardMinRate", "dashboardMaxRate"].forEach((id) => {
	el(id).addEventListener("input", renderOfferings);
});
renderOfferings();

// CSV download
el("downloadCsv").addEventListener("click", () => {
	const rows = [["Bank Name", "Loan Type", "Interest Rate (%)"]];
	const tbody = document.querySelector("#offeringsTable tbody");
	Array.from(tbody.querySelectorAll("tr")).forEach((tr) => {
		rows.push(Array.from(tr.children).slice(0, 3).map((c) => c.textContent));
	});
	const csv = rows.map((r) => r.join(",")).join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "loan_offerings.csv";
	a.click();
});

// Apply Wizard
let applyCurrentStep = 1;
const totalApplySteps = 5;

function updateApplyStep() {
	el("applyStep").textContent = String(applyCurrentStep);
	document.querySelector(".stepper .progress").style.width = `${(applyCurrentStep / totalApplySteps) * 100}%`;
	Array.from(document.querySelectorAll(".apply-step")).forEach((s) => s.classList.add("hidden"));
	document.querySelector(`.apply-step[data-step='${applyCurrentStep}']`).classList.remove("hidden");
	el("applyPrev").disabled = applyCurrentStep === 1;
	el("applyNext").textContent = applyCurrentStep === totalApplySteps ? "Submit" : "Next";
}

el("applyNext").addEventListener("click", () => {
	if (applyCurrentStep < totalApplySteps) {
		if (!validateApplyStep(applyCurrentStep)) return;
		applyCurrentStep += 1;
		if (applyCurrentStep === totalApplySteps) fillApplyReview();
		updateApplyStep();
	} else {
		showToast("Application submitted (demo).", "success");
	}
});

el("applyPrev").addEventListener("click", () => {
	applyCurrentStep = Math.max(1, applyCurrentStep - 1);
	updateApplyStep();
});

function validateApplyStep(step) {
	if (step === 1) {
		if (!el("applyLoanType").value) {
			showToast("Please select a loan type.", "error");
			return false;
		}
	}
	if (step === 2) {
		if (!el("applyFullName").value || !el("applyEmail").value) {
			showToast("Enter name and email.", "error");
			return false;
		}
	}
	if (step === 3) {
		if (!el("applyIncome").value || !el("applyEmployment").value) {
			showToast("Provide income and employment.", "error");
			return false;
		}
	}
	return true;
}

function fillApplyReview() {
	const ltKey = el("applyLoanType").value;
	const lt = loanTypes.find((x) => x.key === ltKey);
	const summary = `Loan Type: ${lt?.name || "-"}\nName: ${el("applyFullName").value}\nEmail: ${el("applyEmail").value}\nPhone: ${el("applyPhone").value}\nMonthly Income: ${formatINR(el("applyIncome").value)}\nEmployment: ${el("applyEmployment").value}\nDesired Amount: ${formatINR(el("applyAmount").value)}\nTenure: ${el("applyTenure").value} months`;
	el("applyReview").textContent = summary;
}

updateApplyStep();

// Detailed Application save
el("saveDetailed").addEventListener("click", () => {
	const form = document.getElementById("detailedForm");
	const data = Object.fromEntries(new FormData(form).entries());
	if (!data.fullName || !data.phone || !data.amountNeeded) {
		showToast("Please fill Full Name, Phone, and Loan Amount Needed.", "error");
		return;
	}
	const existing = JSON.parse(localStorage.getItem("applications") || "[]");
	existing.push({ id: Date.now(), ...data });
	localStorage.setItem("applications", JSON.stringify(existing));
	showToast("Application saved successfully.");
	renderApplications();
});

function renderApplications() {
	const container = el("applicationsList");
	const items = JSON.parse(localStorage.getItem("applications") || "[]");
	if (!items.length) {
		container.classList.add("empty");
		container.innerHTML = `<div class="empty-state"><i class="ti ti-search"></i><div><h3>No Saved Applications</h3><p class="muted">Submitted applications from the 'Detailed Application' form will appear here.</p></div></div>`;
		return;
	}
	container.classList.remove("empty");
	container.innerHTML = `<table class='table'><thead><tr><th>Name</th><th>Phone</th><th>Loan Type</th><th>Amount Needed</th><th>Actions</th></tr></thead><tbody></tbody></table>`;
	const tbody = container.querySelector("tbody");
	items.forEach((a) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td>${a.fullName}</td><td>${a.phone}</td><td>${a.loanType || "-"}</td><td>${formatINR(a.amountNeeded)}</td><td><button class='action' data-id='${a.id}' data-act='del'><i class='ti ti-trash'></i> Delete</button></td>`;
		tbody.appendChild(tr);
	});
	container.addEventListener("click", (e) => {
		const target = e.target.closest("button.action");
		if (!target) return;
		const id = Number(target.dataset.id);
		const arr = JSON.parse(localStorage.getItem("applications") || "[]");
		localStorage.setItem("applications", JSON.stringify(arr.filter((x) => x.id !== id)));
		showToast("Application removed");
		renderApplications();
	});
}

// Compare loans table
function renderCompare() {
	const tbody = document.querySelector("#compareTable tbody");
	tbody.innerHTML = "";
	loanTypes.forEach((lt) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td><i class='${lt.icon}'></i> ${lt.name}</td><td>${lt.rate}%</td><td>${lt.maxTenure}</td><td>${formatINR(lt.maxAmount)}</td><td><button class='action' data-key='${lt.key}'><i class='ti ti-check'></i> Select for EMI Calc</button></td>`;
		tbody.appendChild(tr);
	});
	tbody.addEventListener("click", (e) => {
		const btn = e.target.closest("button.action");
		if (!btn) return;
		const key = btn.dataset.key;
		const lt = loanTypes.find((x) => x.key === key);
		selectLoanForEmi(lt);
	});
}

// EMI calculation helpers
function pmt(rate, nper, pv) {
	const i = rate / 12 / 100;
	return (pv * i) / (1 - Math.pow(1 + i, -nper));
}

function selectLoanForEmi(lt) {
	el("emiCard").classList.add("visible");
	el("emiRateNote").textContent = `Using selected loan type rate: ${lt.rate}%`;
	el("emiRate").value = lt.rate;
	el("emiTenure").value = Math.min(60, lt.maxTenure);
	el("emiAmountRange").max = String(lt.maxAmount);
	el("emiAmountRange").value = Math.min(500000, lt.maxAmount);
	el("emiAmount").value = Math.min(500000, lt.maxAmount);
	window.selectedLoan = lt;
}

["emiAmountRange", "emiAmount"].forEach((id) => {
	el(id).addEventListener("input", () => {
		if (id === "emiAmountRange") el("emiAmount").value = el("emiAmountRange").value;
		else el("emiAmountRange").value = el("emiAmount").value;
	});
});

el("calcEmi").addEventListener("click", () => {
	const amount = Number(el("emiAmount").value || 0);
	const tenure = Number(el("emiTenure").value || 0);
	const rate = Number(el("emiRate").value || 0);
	if (!amount || !tenure || !rate) {
		showToast("Enter amount, tenure, and rate.", "error");
		return;
	}
	const emi = pmt(rate, tenure, amount);
	const totalPay = emi * tenure;
	const interest = totalPay - amount;
	const result = `EMI: ${formatINR(emi.toFixed(2))}\nTotal Interest: ${formatINR(interest.toFixed(2))}\nTotal Payment: ${formatINR(totalPay.toFixed(2))}`;
	const box = el("emiResult");
	box.textContent = result;
	box.classList.remove("hidden");
	const report = { time: Date.now(), loan: window.selectedLoan || null, amount, tenure, rate, emi, totalPay, interest };
	localStorage.setItem("loanReport", JSON.stringify(report));
	showToast("EMI calculated and saved for report.");
});

// Rates page
function renderRates() {
	const tbody = el("ratesTable").querySelector("tbody");
	tbody.innerHTML = "";
	loanTypes.forEach((lt) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td><i class='${lt.icon}'></i> ${lt.name}</td><td>${lt.rate}%</td>`;
		tbody.appendChild(tr);
	});
	const d = new Date();
	el("ratesUpdated").textContent = `Rates updated on ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
}

// Report page
function renderReport() {
	const container = el("reportCard");
	const data = JSON.parse(localStorage.getItem("loanReport") || "null");
	const apps = JSON.parse(localStorage.getItem("applications") || "[]");
	const latestApp = apps[apps.length - 1];
	const ready = el("reportReady");
	const empty = el("reportEmpty");
	if (!data && !latestApp) {
		ready.classList.add("hidden");
		empty.classList.remove("hidden");
		return;
	}
	empty.classList.add("hidden");
	ready.classList.remove("hidden");
	ready.innerHTML = `
		<div class='grid two'>
			<div>
				<h3>Applicant</h3>
				<p>${latestApp ? latestApp.fullName : "Sample User"}</p>
				<p class='muted'>Phone: ${latestApp ? latestApp.phone : "9999999999"}</p>
				<p class='muted'>Loan Amount Needed: ${latestApp ? formatINR(latestApp.amountNeeded) : formatINR(500000)}</p>
			</div>
			<div>
				<h3>EMI Summary</h3>
				<p>Loan Type: ${(data && data.loan) ? data.loan.name : "Home Loan"}</p>
				<p>Amount: ${formatINR(data ? data.amount : 500000)}</p>
				<p>Tenure: ${data ? data.tenure : 60} months</p>
				<p>Rate: ${(data ? data.rate : 8.5)}%</p>
				<p><strong>EMI: ${formatINR(data ? data.emi.toFixed(2) : 10249.55)}</strong></p>
			</div>
		</div>
		<div class='form-nav end'><button id='downloadPdf' class='btn'><i class='ti ti-download'></i><span>Download PDF Report</span></button></div>
	`;
	el("downloadPdf").addEventListener("click", downloadPdfReport);
	// Also wire sample button if visible
	const sampleBtn = document.getElementById("downloadSample");
	if (sampleBtn) sampleBtn.onclick = () => downloadPdfReport();
}

async function downloadPdfReport() {
	const { jsPDF } = window.jspdf;
	const doc = new jsPDF();
	doc.setFontSize(18);
	doc.text("Loan Report", 14, 18);
	doc.setFontSize(12);
	const apps = JSON.parse(localStorage.getItem("applications") || "[]");
	const latestApp = apps[apps.length - 1] || { fullName: "Sample User", phone: "9999999999", amountNeeded: 500000 };
	const data = JSON.parse(localStorage.getItem("loanReport") || "null") || { loan: { name: "Home Loan" }, amount: 500000, tenure: 60, rate: 8.5, emi: 10249.55, totalPay: 614973, interest: 114973 };
	const lines = [
		`Applicant: ${latestApp.fullName}`,
		`Phone: ${latestApp.phone}`,
		`Loan Needed: ${formatINR(latestApp.amountNeeded)}`,
		"",
		`Loan Type: ${data.loan?.name || "-"}`,
		`Amount: ${formatINR(data.amount)}`,
		`Tenure: ${data.tenure} months`,
		`Rate: ${data.rate}%`,
		`EMI: ${formatINR(data.emi.toFixed(2))}`,
		`Total Interest: ${formatINR(data.interest.toFixed(2))}`,
		`Total Payment: ${formatINR(data.totalPay.toFixed(2))}`,
	];
	let y = 28;
	lines.forEach((t) => { doc.text(t, 14, y); y += 8; });
	doc.save("loan_report.pdf");
}

// AI suggestions demo
el("getAi").addEventListener("click", async () => {
	const target = el("aiPrompt").value.trim();
	const box = el("aiResult");
	const err = el("aiError");
	err.classList.add("hidden");
	box.classList.remove("hidden");
	box.textContent = "Fetching suggestions...";
	try {
		await new Promise((r) => setTimeout(r, 600));
		if (!target) throw new Error("Missing input");
		const tips = [
			"Use visuals with familiar local symbols (e.g., crops, houses).",
			"Provide examples in local currency and typical income levels.",
			"Keep forms mobile-friendly with large touch targets.",
			"Translate key terms and avoid jargon.",
			"Offer voice guidance in local language where possible.",
		];
		box.innerHTML = `<ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
	} catch (err) {
		box.classList.add("hidden");
		err.classList.remove("hidden");
	}
});

// Router init
(function initRouteFromHash() {
	const hash = location.hash.replace("#", "");
	if (routes.includes(hash)) navigate(hash); else navigate("dashboard");
})();