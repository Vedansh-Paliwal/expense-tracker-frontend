import styles from "./Dashboard.module.css"
import { Sidebar } from "../../components/Sidebar.jsx"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

const ADD_EXPENSE_URL = "http://localhost:8080/expenses";
const FINANCIAL_ANALYSIS_URL = "http://localhost:8080/ai/financial-analysis";
const VIEW_BUDGET_URL = "http://localhost:8080/expenses/view-budget";
const GET_EXPENSES_SUMMARY_URL = "http://localhost:8080/expenses/analytics/summary";
const GET_EXPENSES_BY_CATEGORY_URL = "http://localhost:8080/expenses/analytics/by-category";
const EXPORT_URL = "http://localhost:8080/expenses/export";
const SET_BUDGET_URL = "http://localhost:8080/expenses/set-budget";

export const Dashboard = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [error, setError] = useState("");
    const [expenseFormData, setExpenseFormData] = useState({
        title: "", amount: 0.01, category: "", description: "", date: "", paymentMethod: ""
    });
    const [budgetFormData, setBudgetFormData] = useState({budgetAmount: 0.01});
    const [aiFormData, setAiFormData] = useState({monthlyIncome: "", savingsGoal: "", financialPriority: ""});
    const [aiResponse, setAiResponse] = useState(null);
    const [isBudgetOpen, setIsBudgetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [budgetData, setBudgetData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [expensesData, setExpensesData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect( () => {
        const fetchData = async () => {
            const GET_ALL_EXPENSES_URL = `http://localhost:8080/expenses?page=${currentPage}&size=10`;
            try {
                    const budgetResponse = await fetch(VIEW_BUDGET_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if(budgetResponse.ok) {
                    const budgetData = await budgetResponse.json();
                    setBudgetData(budgetData);
                }
                else if(budgetResponse.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (budgetResponse.status === 404) {
                    setBudgetData({
                        budget: 0,
                        totalSpent: 0,
                        remaining: 0
                    });
                }
                else if(budgetResponse.status === 400) {
                    console.log("Invalid input from user side");
                    return;
                }
                else {
                    console.log("Something went wrong. Please try again later");
                    return;
                }
            } catch(e) {
                console.log("Network error. Can't reach server. Please try again");
                return;
            }
            try {
                const expenseSummaryResponse = await fetch(GET_EXPENSES_SUMMARY_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if(expenseSummaryResponse.ok) {
                    const expenseSummaryData = await expenseSummaryResponse.json();
                    setSummaryData(expenseSummaryData);
                }
                else if(expenseSummaryResponse.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (expenseSummaryResponse.status === 404) {
                    setSummaryData({
                        totalExpenses: 0,
                        totalThisYear: 0,
                        averageAmount: 0,
                        totalAmount: 1 // ⚠️ IMPORTANT (avoid divide by 0)
                    });
                }
                else if(expenseSummaryResponse.status === 400) {
                    console.log("Invalid input from user side");
                    return;
                }
                else {
                    console.log("Something went wrong. Please try again later");
                    return;
                }
            } catch (e) {
                console.log("Network error. Can't reach server. Please try again");
                return;
            }
            try {
                const expensesInfo = await fetch(GET_ALL_EXPENSES_URL,{
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if(expensesInfo.ok) {
                    const expensesData = await expensesInfo.json();
                    setExpensesData(expensesData);
                }
                else if(expensesInfo.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (expensesInfo.status === 404) {
                    setExpensesData({
                        content: [],
                        page: 0,
                        size: 10,
                        totalElements: 0,
                        totalPages: 1
                    });
                }
                else if(expensesInfo.status === 400) {
                    console.log("Invalid input from user side");
                    return;
                }
                else {
                    console.log("Something went wrong. Please try again later");
                    return;
                }
            } catch (error) {
                console.log("Network error. Can't reach server. Please try again");
                return;
            }
            try {
                const categoryBreakdown = await fetch(GET_EXPENSES_BY_CATEGORY_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if(categoryBreakdown.ok) {
                    const categoryBreakdownData = await categoryBreakdown.json();
                    setCategoryData(categoryBreakdownData);
                }
                else if(categoryBreakdown.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (categoryBreakdown.status === 404) {
                    setCategoryData([]);
                }
                else if(categoryBreakdown.status === 400) {
                    console.log("Invalid input from user side");
                    return;
                }
                else {
                    console.log("Something went wrong. Please try again later");
                    return;
                }
            } catch (error) {
                console.log("Network error. Can't reach server. Please try again");
                return;
            }
            setIsPageLoading(false);
        };
        fetchData();
    }, [currentPage, refresh]);

    const handleExpenseClose = () => {
        setIsOpen(false);
        setError("");
        setExpenseFormData({ title: "", amount: 0.01, category: "", description: "", date: "", paymentMethod: "" });
        setSelectedExpenseId(null);
    }

    const handleAiClose = () => {
        setIsAiOpen(false);
        setError("");
        setAiFormData({ monthlyIncome: "", savingsGoal: "", financialPriority: "" });
        setAiResponse(null);
    }

    const handleBudgetClose = () => {
        setIsBudgetOpen(false);
        setError("");
        setBudgetFormData({monthlyBudget: ""});
    }

    const handleExpenseFormChange = (e) => {
        const { name, value } = e.target;
        setExpenseFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAiFormChange = (e) => {
        const {name, value} = e.target;
        setAiFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBudgetFormChange = (e) => {
        const {name, value} = e.target;
        setBudgetFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if(expenseFormData.title.trim().length === 0 || expenseFormData.amount <= 0 || expenseFormData.category.trim().length === 0 || 
            expenseFormData.description.trim().length === 0 || expenseFormData.date.trim().length === 0 || expenseFormData.paymentMethod.trim().length === 0) {
                setError("Please fill in all the fields");
                return;
        }
        const isUpdate = selectedExpenseId !== null;
        const url = isUpdate
            ? `http://localhost:8080/expenses/${selectedExpenseId}`
            : ADD_EXPENSE_URL;
        const method = isUpdate ? "PUT" : "POST";
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(expenseFormData)
            });
            if (response.ok) {
                handleExpenseClose();
                setRefresh(prev => prev + 1);
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else if(response.status === 400) {
                setError("Please send proper inputs");
            }
            else {
                setError("Something went wrong. Please try again later.");
            }
        }
        catch(e) {
            setError("Network error. Can't reach server. Please try again");
        }
    };

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if(aiFormData.monthlyIncome.trim().length === 0 || aiFormData.savingsGoal.trim().length === 0 || 
            aiFormData.financialPriority.trim().length === 0) {
                setError("Please fill in all the fields");
                return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(FINANCIAL_ANALYSIS_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aiFormData)
            });
            if(response.ok) {
                const data = await response.json();
                setAiResponse(data);
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else if(response.status === 400) {
                setError("Please send proper inputs");
            }
            else {
                setError("Something went wrong. Please try again later.");
            }
        }
        catch(e) {
            setError("Network error. Can't reach server. Please try again");
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if(budgetFormData.budgetAmount <= 0) {
            setError("Please fill in all the fields");
            return;
        }
        try {
            const response = await fetch(SET_BUDGET_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(budgetFormData)
            });
            if(response.ok) {
                setRefresh(prev => prev + 1);
                handleBudgetClose();
                return;
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else if(response.status === 400) {
                setError("Please send proper inputs");
            }
            else {
                setError("Something went wrong. Please try again later.");
            }
        } catch (error) {
            setError("Network error. Can't reach server. Please try again");
            return;
        }
    }

    const getCategoryColor = (category) => {
        const colors = {
            food: "#f59e0b",
            travel: "#3b82f6",
            rent: "#ef4444",
            shopping: "#ec4899",
            utilities: "#8b5cf6",
            health: "#10b981",
            entertainment: "#f97316",
            other: "#6b7280"
        };
        return colors[category] || "#6b7280";
    }

    const handleExport = async () => {
        try {
            const response = await fetch(EXPORT_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if(response.ok) {
                const blob = await response.blob(); // converts the raw bytes from backend into a Blob object (Binary Large Object — basically a file in memory)
                const url = window.URL.createObjectURL(blob); // creates a temporary URL pointing to that blob in memory, like blob://...
                const a = document.createElement("a"); // creates a new <a> tag in memory (not visible on screen)
                a.href = url; // points that link to the blob URL
                a.download = "expenses.csv"; // tells browser to download it with this filename
                a.click(); //  programmatically clicks that invisible link, triggering the download
                window.URL.revokeObjectURL(url); // cleans up the temporary URL from memory since we no longer need it
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else {
                console.log("Export failed");
                return;
            }
        } catch (error) {
            console.log("Network error. Can't reach server. Please try again");
            return;
        }
    }

    const handleExpenseUpdateClick = (expense) => {
        setSelectedExpenseId(expense.id);
        setExpenseFormData({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            date: expense.date,
            paymentMethod: expense.paymentMethod
        });
        setIsOpen(true);
    }

    const handleExpenseDelete = async (expenseId) => {
        const DELETE_EXPENSE = `http://localhost:8080/expenses/${expenseId}`;
        const confirmed = confirm("Are you sure you want to delete this expense? You won't be able to bring it back after that.");
        if(!confirmed) return;
        try {
            const response = await fetch(DELETE_EXPENSE, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if(response.status === 204) {
                setRefresh(prev => prev + 1);
                return;
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else {
                console.log("Delete failed");
                return;
            }
        } catch (error) {
            console.log("Network error. Can't reach server. Please try again");
            return;
        }
    }

    const handleAllExpensesDelete = async () => {
        const DELETE_ALL_EXPENSES = "http://localhost:8080/expenses?confirm=true";
        const confirmed = confirm("Are you sure you want to this? This will delete all your expenses and you won't be able to get them back!");
        if(!confirmed) return;
        try {
            const response = await fetch(DELETE_ALL_EXPENSES, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if(response.status === 204) {
                setRefresh(prev => prev + 1);
                return;
            }
            else if(response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
            else {
                console.log("Deletion failed");
                return;
            }
        } catch (error) {
            console.log("Network error. Can't reach server. Please try again");
            return;
        }
    }

    if(isPageLoading) {
        return <p>Loading...</p>
    }

    const budgetPercent = budgetData.budget === 0 ? 0 : Math.min(Math.round((budgetData.totalSpent / budgetData.budget) * 100), 100);
    
    return(
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <h2 className={styles.topbarTitle}>Dashboard</h2>
                    <div className={styles.topbarOptions}>
                        <button className={styles.exportButton} onClick={() => handleExport()}>⬇︎ Export</button>
                        <button className={styles.addExpenseButton} onClick={() => setIsOpen(true)}>+ Add Expense</button>
                        <button className={styles.setBudgetButton} onClick={() => setIsBudgetOpen(true)}>Set Budget</button>
                    </div>
                </div>
                <div className={styles.statGrid}>
                    <div className={`${styles.statCard} ${styles.accent}`}>
                        <p className={styles.sectionHeading}>MONTHLY BUDGET</p>
                        <div className={styles.sectionValue}>
                            <p className={styles.numericalValue}>₹ {budgetData.budget}</p>
                            <div className={styles.progressTrack}>
                                <div className={styles.progressFill} style={{width: `${budgetPercent}%`}}></div>
                            </div>
                        </div>
                        <p className={styles.sectionInfo}>{budgetData.budget === 0 ? 0 : Math.round((budgetData.totalSpent / budgetData.budget) * 100)}% used · ₹ {budgetData.remaining} remaining</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.sectionHeading}>TOTAL SPENT</p>
                        <div className={styles.sectionValue}>
                            <p className={styles.numericalValue}>₹ {budgetData.totalSpent}</p>
                        </div>
                        <p className={styles.sectionInfo}>Avg. ₹ {summaryData.averageAmount} per expense · This month</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.sectionHeading}>TOTAL TRANSACTIONS</p>
                        <div className={styles.sectionValue}>
                            <p className={styles.numericalValue}>{summaryData.totalExpenses}</p>
                        </div>
                        <p className={styles.sectionInfo}>₹ {summaryData.totalThisYear} spent this year</p>
                    </div>
                </div>
                <div className={styles.bottomGrid}>
                    <div className={styles.expensesPanel}>
                        <div className={styles.expensesTopSection}>
                            <h2 className={styles.expensesSectionTitle}>Recent Expenses</h2>
                            <div className={styles.expensesFunctionalityButtons}>
                                <button className={styles.exportButton} onClick={() => navigate("/expenses")}>View All</button>
                                <button onClick={() => handleAllExpensesDelete()} className={styles.deleteAllExpenses}>Delete All Expenses</button>
                            </div>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>DESCRIPTION</th>
                                        <th>CATEGORY</th>
                                        <th>DATE</th>
                                        <th>AMOUNT</th>
                                        <th>PAYMENT METHOD</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expensesData?.content?.length === 0 ? (
                                        <tr>
                                            <td colSpan="7">No expenses yet</td>
                                        </tr>
                                    ) : (
                                        expensesData.content.map((expense) => (
                                            <tr key={expense.id}>
                                            <td>{expense.title}</td>
                                            <td>{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                                            <td>{expense.date}</td>
                                            <td>{expense.amount}</td>
                                            <td>{expense.paymentMethod.toUpperCase()}</td>
                                            <td><button onClick={() => handleExpenseUpdateClick(expense)} className={styles.updateExpense}>Update</button></td>
                                            <td><button onClick={() => handleExpenseDelete(expense.id)} className={styles.deleteExpense}>Delete</button></td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.pagination}>
                            <button 
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 0}
                            >
                                ‹ Previous
                            </button>
                            <span>Page {currentPage + 1} of {expensesData.totalPages}</span>
                            <button 
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={(currentPage === expensesData.totalPages - 1) || (expensesData.totalPages === 0)}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                    <div className={styles.byCategory}>
                        <div className={styles.categoryTopSection}>
                            <h2 className={styles.expensesSectionTitle}>By Category</h2>
                        </div>
                        <div className={styles.categoryBottomSection}>
                            <div className={styles.categoryBottomSection}>
                                {categoryData?.length === 0 ? (
                                    <p>No category data yet</p>
                                ) : (
                                    categoryData.map((item) => (
                                        <div key={item.category} className={styles.category}>
                                        <div className={styles.categoryDetails}>
                                            <span>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                                            <span>₹{item.totalAmount}</span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div className={styles.progressFill} style={{
                                                width: `${Math.min((item.totalAmount / summaryData.totalAmount) * 100, 100)}%`,
                                                background: getCategoryColor(item.category)
                                            }}></div>
                                        </div>
                                    </div>
                                )))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.aiButton} onClick={() => setIsAiOpen(true)}> ✨ </div>
                {isOpen && (
                    <div className={styles.modalOverlay} onClick={handleExpenseClose}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{selectedExpenseId ? "Update Expense" : "Add Expense"}</h2>
                                <button onClick={handleExpenseClose} className={styles.closeButton}>✕</button>
                            </div>
                            <form onSubmit={handleExpenseSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Title <span className={styles.required}>*</span></label>
                                    <input 
                                        type="text"
                                        name="title"
                                        value={expenseFormData.title}
                                        onChange={handleExpenseFormChange}
                                        placeholder="Enter title"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Amount <span className={styles.required}>*</span></label>
                                    <input 
                                        type="number"
                                        name="amount"
                                        value={expenseFormData.amount}
                                        onChange={handleExpenseFormChange}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Date <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={expenseFormData.date}
                                        onChange={handleExpenseFormChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category <span className={styles.required}>*</span></label>
                                    <select
                                        name="category"
                                        value={expenseFormData.category}
                                        onChange={handleExpenseFormChange}
                                    >
                                        <option value="">Select category</option>
                                        <option value="food">Food</option>
                                        <option value="travel">Travel</option>
                                        <option value="rent">Rent</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="health">Health</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Payment Method <span className={styles.required}>*</span></label>
                                    <select
                                        name="paymentMethod"
                                        value={expenseFormData.paymentMethod}
                                        onChange={handleExpenseFormChange}
                                    >
                                        <option value="">Select your payment method</option>
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI</option>
                                        <option value="card">Card</option>
                                        <option value="netBanking">Net Banking</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Description <span className={styles.required}>*</span></label>
                                    <input 
                                        type="textarea"
                                        name="description"
                                        value={expenseFormData.description}
                                        onChange={handleExpenseFormChange}
                                        placeholder="Enter description"
                                    />
                                </div>
                                <button type="submit" className={styles.submitFormButton}>
                                    {selectedExpenseId ? "Update Expense" : "Add Expense"}
                                </button>
                                {error && (<p className={styles.errorText}>{error}</p>)}
                            </form>
                        </div>
                    </div>
                )}
                {isAiOpen && (
                    <div className={styles.modalOverlay} onClick={handleAiClose}>
                        {!aiResponse ? (
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Get your financial report from our AI</h2>
                                <button onClick={handleAiClose} className={styles.closeButton}>✕</button>
                            </div>
                            <form onSubmit={handleAiSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Monthly Income <span className={styles.required}>*</span> </label>
                                    <input 
                                        type="number"
                                        name="monthlyIncome"
                                        value={aiFormData.monthlyIncome}
                                        onChange={handleAiFormChange}
                                        placeholder="Enter your monthly income"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Savings Goal <span className={styles.required}>*</span> </label>
                                    <input 
                                        type="number"
                                        name="savingsGoal"
                                        value={aiFormData.savingsGoal}
                                        onChange={handleAiFormChange}
                                        placeholder="Enter your savings goal"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Financial Priority <span className={styles.required}>*</span> </label>
                                    <input 
                                        type="text"
                                        name="financialPriority"
                                        value={aiFormData.financialPriority}
                                        onChange={handleAiFormChange}
                                        placeholder="Enter your financial priority"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className={styles.submitFormButton}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Analysing..." : "Submit"}
                                </button>
                                {error && (<p className={styles.errorText}>{error}</p>)}
                            </form>
                            </div>
                        ) : (
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h2>Your Financial Report</h2>
                                    <button onClick={handleAiClose} className={styles.closeButton}>✕</button>
                                </div>
                                <div className={styles.aiResponse}>
                                    <p>Health Score: {aiResponse.financialHealthScore}</p>
                                    <p>Summary: {aiResponse.overallSummary}</p>
                                    <p>Spending Behaviour: {aiResponse.spendingBehaviour}</p>
                                    <p>Budget Exceeded: {aiResponse.budgetExceededThisMonth ? "Yes" : "No"}</p>
                                    <p>Savings Rate: {aiResponse.savingsRate}%</p>
                                    <p>Strengths:</p>
                                    <ul>
                                        {aiResponse.strengths.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                    <p>Risks:</p>
                                    <ul>
                                        {aiResponse.risks.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                    <p>Recommendations:</p>
                                    <ul>
                                        {aiResponse.recommendations.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {isBudgetOpen && (
                    <div className={styles.modalOverlay} onClick={handleBudgetClose}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Set Budget</h2>
                                <button onClick={handleBudgetClose} className={styles.closeButton}>✕</button>
                            </div>
                            <form onSubmit={handleBudgetSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Monthly Budget <span className={styles.required}>*</span></label>
                                    <input 
                                        type="number"
                                        name="budgetAmount"
                                        value={budgetFormData.budgetAmount}
                                        onChange={handleBudgetFormChange}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <button type="submit" className={styles.submitFormButton}>Submit</button>
                                {error && (<p className={styles.errorText}>{error}</p>)}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};