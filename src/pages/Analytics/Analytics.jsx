import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar.jsx"
import styles from "./Analytics.module.css"


const CATEGORY_COLORS = {
    food: "#f59e0b",
    travel: "#3b82f6",
    rent: "#ef4444",
    shopping: "#ec4899",
    utilities: "#8b5cf6",
    health: "#10b981",
    entertainment: "#f97316",
    other: "#6b7280"
};
const currentYear = new Date().getFullYear();
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const Analytics = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);
    const [categoryData, setCategoryData] = useState([]);
    const [categoryYear, setCategoryYear] = useState("");
    const [categoryMonth, setCategoryMonth] = useState("");
    const [appliedCategoryYear, setAppliedCategoryYear] = useState("");
    const [appliedCategoryMonth, setAppliedCategoryMonth] = useState("");
    const [monthlyYear, setMonthlyYear] = useState(String(currentYear));
    const [monthlyData, setMonthlyData] = useState([]);
    const [appliedMonthlyYear, setAppliedMonthlyYear] = useState(String(currentYear));
    const [stackedYear, setStackedYear] = useState(String(currentYear));
    const [appliedStackedYear, setAppliedStackedYear] = useState(String(currentYear));
    const [stackedData, setStackedData] = useState([]);

    useEffect(() => {
        const fetchCategoryData = async () => {
            const params = new URLSearchParams();
            if (categoryYear) params.set("year", categoryYear);
            if (categoryMonth) params.set("month", categoryMonth);
            const GET_EXPENSES_BY_CATEGORY_URL = `https://expense-tracker-backend-kobn.onrender.com/expenses/analytics/by-category?${params.toString()}`;
            try {
                const response = await fetch(GET_EXPENSES_BY_CATEGORY_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const expensesByCategory = await response.json();
                    setCategoryData(expensesByCategory);
                }
                else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (response.status === 400) {
                    console.log("Invalid input from user side.")
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
        };
        fetchCategoryData();
    }, [appliedCategoryYear, appliedCategoryMonth]);

    useEffect(() => {
        if (!appliedMonthlyYear) return;
        const fetchMonthly = async () => {
            const GET_MONTHLY_EXPENSES_BY_YEAR_URL = `https://expense-tracker-backend-kobn.onrender.com/expenses/analytics/monthly?year=${appliedMonthlyYear}`;
            try {

                const response = await fetch(GET_MONTHLY_EXPENSES_BY_YEAR_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const transformed = data.map(item => ({
                        ...item,
                        month: MONTH_NAMES[item.month - 1]
                    }));
                    setMonthlyData(transformed);
                }
                else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (response.status === 400) {
                    console.log("Invalid input from user side.")
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
        };
        fetchMonthly();
    }, [appliedMonthlyYear]);

    useEffect(() => {
        if (!appliedStackedYear) return;
        const fetchStacked = async () => {
            try {
                const response = await fetch(`https://expense-tracker-backend-kobn.onrender.com/expenses/analytics/monthly-by-category?year=${appliedStackedYear}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const transformed = {};
                    data.forEach(item => {
                        const monthName = MONTH_NAMES[item.month - 1];
                        if (!transformed[monthName]) {
                            transformed[monthName] = { month: monthName };
                        }
                        transformed[monthName][item.category] = item.totalAmount;
                    });
                    setStackedData(Object.values(transformed));
                }
                else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
                else if (response.status === 400) {
                    console.log("Invalid input from user side.")
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
        };
        fetchStacked();
    }, [appliedStackedYear]);
    return (
        <>
            <Sidebar />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Analytics</h1>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Spending by Category</h2>
                    <div className={styles.filters}>
                        <div className={styles.filterItem}>
                            <label>Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 2026"
                                value={categoryYear}
                                onChange={(e) => {
                                    setCategoryYear(e.target.value);
                                    setCategoryMonth(""); // reset month when year changes
                                }}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <label>Month</label>
                            <input
                                type="number"
                                placeholder="1-12"
                                value={categoryMonth}
                                disabled={categoryYear === ""} // month requires year
                                onChange={(e) => setCategoryMonth(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.applyBtn}
                                onClick={() => {
                                    setAppliedCategoryYear(categoryYear);
                                    setAppliedCategoryMonth(categoryMonth);
                                }}
                            >
                                Apply
                            </button>
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.resetBtn}
                                onClick={() => {
                                    setCategoryYear("");
                                    setCategoryMonth("");
                                    setAppliedCategoryYear("");
                                    setAppliedCategoryMonth("");
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {categoryData.length === 0 ? (
                        <p>No data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="totalAmount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                >
                                    {categoryData.map((entry) => (
                                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Monthly Spending By Year</h2>
                    <div className={styles.filters}>
                        <div className={styles.filterItem}>
                            <label>Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 2026"
                                value={monthlyYear}
                                onChange={(e) => {
                                    setMonthlyYear(e.target.value);
                                }}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.applyBtn}
                                onClick={() => setAppliedMonthlyYear(monthlyYear)}
                            >
                                Apply
                            </button>
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.resetBtn}
                                onClick={() => {
                                    setMonthlyYear(String(currentYear));
                                    setAppliedMonthlyYear(String(currentYear));
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {monthlyData.length === 0 ? (
                        <p>No data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalAmount" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Monthly Expenses By Category per year</h2>
                    <div className={styles.filters}>
                        <div className={styles.filterItem}>
                            <label>Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 2026"
                                value={stackedYear}
                                onChange={(e) => {
                                    setStackedYear(e.target.value);
                                }}
                            />
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.applyBtn}
                                onClick={() => setAppliedStackedYear(stackedYear)}
                            >
                                Apply
                            </button>
                        </div>
                        <div className={styles.filterItem}>
                            <label>&nbsp;</label>
                            <button
                                className={styles.resetBtn}
                                onClick={() => {
                                    setStackedYear(String(currentYear));
                                    setAppliedStackedYear(String(currentYear));
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {stackedData.length === 0 ? (
                        <p>No data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stackedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {Object.keys(CATEGORY_COLORS).map(category => (
                                    <Bar key={category} dataKey={category} stackId="a" fill={CATEGORY_COLORS[category]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </>
    );
};