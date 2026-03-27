import styles from "./ExpensesPage.module.css"
import { Sidebar } from "../../components/Sidebar";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const ExpensesPage = () => {
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const params = new URLSearchParams();
    const [expensesData, setExpensesData] = useState(null);
    const defaultFilters = {
        category: "",
        paymentMethod: "",
        minAmount: "",
        maxAmount: "",
        startDate: "",
        endDate: "",
        sortBy: "",
        order: "",
        page: 0,
        size: 10
    };
    const [filters, setFilters] = useState(defaultFilters);

    Object.entries(filters).forEach((item) => {
        const key = item[0];
        const value = item[1];

        if (value !== "" && value !== null) {
            params.set(key, value);
        }
    });
    const GET_ALL_EXPENSES_URL = `https://expense-tracker-backend-kobn.onrender.com/expenses?${params.toString()}`;

    useEffect(() => {
        const fetchExpenses = async () => {
            console.log(filters);
            if (filters.minAmount && filters.maxAmount) {
                if (Number(filters.minAmount) > Number(filters.maxAmount)) {
                    return; // don't call API
                }
            }
            if (filters.startDate && filters.endDate) {
                if (filters.startDate > filters.endDate) {
                    return;
                }
            }
            try {
                const response = await fetch(GET_ALL_EXPENSES_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setExpensesData(data);
                } else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                } else if (response.status === 404) {
                    setExpensesData({
                        content: [],
                        page: 0,
                        size: 10,
                        totalElements: 0,
                        totalPages: 1
                    });
                }
            } catch {
                console.log("Error fetching expenses");
            }
        };
        fetchExpenses();
    }, [filters]);

    const handleExport = async () => {
        const exportParams = new URLSearchParams();
        Object.entries(filters).forEach(([key,value]) => {
            if(value !== "" && value !== null && key !== "page" && key !== "size") {
                exportParams.set(key, value);
            }
        });
        const EXPORT_URL = `http://localhost:8080/expenses/export?${exportParams.toString()}`;
        try {
            const response = await fetch(EXPORT_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if(response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "expenses.csv";
                a.click();
                window.URL.revokeObjectURL(url);
            }
            else if (response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            }
        } catch(error) {
            console.log("Export failed");
        }
    };

    if (!expensesData) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <Sidebar />
            <div className={styles.container}>
                <h1>All Expenses</h1>
                <div className={styles.filters}>
                    <div className={styles.filterItem}>
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    category: e.target.value,
                                    page: 0
                                }))
                            }
                        >
                            <option value="">All</option>
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
                    <div className={styles.filterItem}>
                        <label>Payment</label>
                        <select
                            value={filters.paymentMethod}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    paymentMethod: e.target.value,
                                    page: 0
                                }))
                            }
                        >
                            <option value="">All</option>
                            <option value="upi">UPI</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="netbanking">Net Banking</option>
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <label>Min</label>
                        <input
                            type="number"
                            value={filters.minAmount}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    minAmount: e.target.value,
                                    page: 0
                                }))
                            }
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <label>Max</label>
                        <input
                            type="number"
                            value={filters.maxAmount}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    maxAmount: e.target.value,
                                    page: 0
                                }))
                            }
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <label>Start</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    startDate: e.target.value,
                                    page: 0
                                }))
                            }
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <label>End</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    endDate: e.target.value,
                                    page: 0
                                }))
                            }
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <label>Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    sortBy: e.target.value,
                                    page: 0
                                }))
                            }
                        >
                            <option value="">Sort By</option>
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <label>Order</label>
                        <select
                            value={filters.order}
                            onChange={(e) =>
                                setFilters(prev => ({
                                    ...prev,
                                    order: e.target.value,
                                    page: 0
                                }))
                            }
                        >
                            <option value="">Order</option>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <label>&nbsp;</label>
                        <button
                            className={styles.resetBtn}
                            onClick={() => setFilters(defaultFilters)}
                        >
                            Reset
                        </button>
                    </div>
                    <div className={styles.filterItem}>
                        <label>&nbsp;</label>
                        <button
                            className={styles.exportBtn}
                            onClick={handleExport}
                        >
                            ⬇︎ Export
                        </button>
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
                            {expensesData.content.length === 0 ? (
                                <tr>
                                    <td colSpan="7">No expenses found</td>
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
                        onClick={() =>
                            setFilters(prev => ({
                                ...prev,
                                page: prev.page - 1
                            }))
                        }
                        disabled={filters.page === 0}
                    >
                        ‹ Previous
                    </button>
                    <span>Page {filters.page + 1} of {expensesData.totalPages}</span>
                    <button
                        className={styles.pageBtn}
                        onClick={() =>
                            setFilters(prev => ({
                                ...prev,
                                page: prev.page + 1
                            }))
                        }
                        disabled={(filters.page === expensesData.totalPages - 1) || (expensesData.totalPages === 0)}
                    >
                        Next ›
                    </button>
                </div>
            </div>
        </>
    );
};