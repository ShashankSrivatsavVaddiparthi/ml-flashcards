/* batch1_data.js — Data Cleaning, Preprocessing, Feature Eng, Statistics, Pandas, NumPy */

window.BATCH_ID    = 'batch1';
window.BATCH_TITLE = 'Batch 1 — Data Foundations';

window.TOPIC_COLORS = {
  'Data Cleaning':        '#0D47A1',
  'Data Preprocessing':   '#4A148C',
  'Feature Engineering':  '#004D40',
  'Statistical Analysis': '#BF360C',
  'Pandas':               '#880E4F',
  'NumPy':                '#1B5E20',
};

window.FLASHCARD_DATA = [

  // DATA CLEANING
  { id:'dc_01', topic:'Data Cleaning', subtopic:'Definition',
    theory:'Data cleaning finds and fixes problems so data is accurate, complete, and consistent. Raw data almost always has issues: missing values, wrong entries, duplicates, or incorrect formats. If you train a model on dirty data, results will be wrong no matter how good the code is. Garbage in, garbage out.',
    interview:'Data cleaning means fixing problems in the data before we use it. Things like missing values, wrong formats, or duplicate rows all cause wrong results if not fixed. So we always clean first before doing anything else.',
    code:'df.info()\ndf.describe()\ndf.isnull().sum()',
    realworld:'A hospital receives patient records from multiple systems. Before building a readmission prediction model, the team cleans the data — filling missing vitals, removing duplicate entries, fixing date formats. Without this, the model produces wrong predictions and could affect patient care.' },

  { id:'dc_02', topic:'Data Cleaning', subtopic:'Handling Missing Values',
    theory:'Missing values (NaN in pandas) have three fixes: (1) Drop the row if too many values are missing. (2) Fill with mean, median, or mode — called imputation. (3) Interpolate for time-series data — fill based on surrounding values. The right choice depends on how much data is missing and whether the missingness is random.',
    interview:'Missing values are empty cells. We have three ways to handle them. Drop the row if too many values are missing. Fill with the median — called imputation. Or use interpolation for time-series, which fills the gap based on nearby values.',
    code:'df.isnull().sum()\ndf.dropna()\ndf[\"col\"].fillna(df[\"col\"].median())\ndf[\"col\"].interpolate()  # time-series',
    realworld:'An e-commerce company builds a churn model. Some customers have missing age or income data. The team fills missing age with the median age of similar users. Dropping these rows would lose thousands of valid records and make the model less accurate.' },

  { id:'dc_03', topic:'Data Cleaning', subtopic:'Removing Duplicates',
    theory:'Duplicate rows inflate counts, skew aggregations, and make models learn the same pattern twice. Check early and decide whether to drop all copies or keep first/last. Sometimes partial duplicates exist — same customer ID, different spelling of name — requiring manual review.',
    interview:'Duplicate rows are the same record appearing more than once. This inflates numbers and confuses the model. We use duplicated() to find them and drop_duplicates() to remove them.',
    code:'df.duplicated().sum()\ndf.drop_duplicates(inplace=True)\ndf.drop_duplicates(subset=[\"id\"], keep=\"first\")',
    realworld:'A bank receives transaction data from two overlapping systems. Before fraud detection training, they remove duplicate transaction IDs. Without this, the same fraudulent transaction appears twice, making the model think that fraud pattern is twice as common as it really is.' },

  { id:'dc_04', topic:'Data Cleaning', subtopic:'Fixing Data Types',
    theory:'Every column should have the correct data type. A date stored as a string cannot be used for time calculations. A number stored as a string cannot be used in math. Common fixes: convert strings to datetime, object columns to numeric, yes/no to boolean.',
    interview:'Data types tell Python what kind of value is in a column. If a date is stored as text, we cannot do time calculations. So we convert it to proper datetime format. Wrong types cause errors later in feature engineering.',
    code:'df.dtypes\ndf[\"date\"] = pd.to_datetime(df[\"date\"])\ndf[\"price\"] = pd.to_numeric(df[\"price\"], errors=\"coerce\")\ndf[\"flag\"] = df[\"flag\"].astype(bool)',
    realworld:'A retail company exports sales data where order_date is stored as text like "12-05-2023". The analytics pipeline tries to calculate days between order and delivery but fails. Converting to datetime fixes this and enables time-based features like day-of-week.' },

  { id:'dc_05', topic:'Data Cleaning', subtopic:'Handling Outliers',
    theory:'Outliers can be real events or errors. Detect with IQR method (beyond 1.5x IQR from Q1/Q3) or z-score (beyond 3 std deviations). Options: cap them, remove them, or keep them based on business context. Always investigate before removing — an outlier might be a genuine rare event.',
    interview:'Outliers are values very different from the rest. Like if all ages are between 20 and 60 but one row says 999 — that is a data error. We find them using IQR or z-score and then remove or cap them depending on the situation.',
    code:'Q1  = df[\"col\"].quantile(0.25)\nQ3  = df[\"col\"].quantile(0.75)\nIQR = Q3 - Q1\ndf  = df[(df[\"col\"] >= Q1 - 1.5*IQR) &\n         (df[\"col\"] <= Q3 + 1.5*IQR)]',
    realworld:'A ride-sharing company builds a fare prediction model. Most rides cost 50-500 rupees but a few rows show 50,000 due to data entry errors. These outliers pull model predictions up for everyone. The team caps fares at the 99th percentile before training.' },

  { id:'dc_06', topic:'Data Cleaning', subtopic:'Consistency Checks',
    theory:'Same concept must be represented the same way everywhere. Male, male, M, m are all the same but pandas treats them as different categories. Fix by standardising to lowercase, stripping spaces, and mapping variations to one value.',
    interview:'Consistency means the same value is always written the same way. If gender is sometimes Male, sometimes male, sometimes M, pandas treats all three as different categories. We standardise to one format — all lowercase, no extra spaces.',
    code:'df[\"gender\"] = df[\"gender\"].str.lower().str.strip()\ndf[\"city\"] = df[\"city\"].str.title()\ndf[\"col\"].replace({\"m\":\"male\",\"f\":\"female\"})',
    realworld:'A telecom company merges customer data from two regions. One stores city as "mumbai", another as "Mumbai", another as "MUMBAI". A groupby gives three groups instead of one. Standardising to title case fixes this and gives accurate per-city analytics.' },

  { id:'dc_07', topic:'Data Cleaning', subtopic:'Renaming Columns',
    theory:'Messy column names — spaces, capitals, special characters — cause bugs and make code hard to read. Standardise to lowercase with underscores. Especially important when merging tables from different sources that use different naming conventions.',
    interview:'Column names in raw data are often messy with spaces or capitals. We rename them to lowercase with underscores. This makes coding easier and avoids bugs when combining data from multiple sources.',
    code:'df.rename(columns={\"Customer ID\": \"customer_id\"}, inplace=True)\ndf.columns = df.columns.str.lower().str.replace(\" \",\"_\")',
    realworld:'A logistics company pulls data from three vendors. One uses "CustomerID", another "cust_id", another "Customer Id". When merging, the join fails because names do not match. Standardising all to "customer_id" before merging solves the problem immediately.' },

  // DATA PREPROCESSING
  { id:'pp_01', topic:'Data Preprocessing', subtopic:'Definition',
    theory:'Preprocessing transforms cleaned data into a format ML models can understand. Models cannot handle text categories directly or very large/small numbers well. Preprocessing encodes categories into numbers, scales numerical values, and structures data correctly. Cleaning fixes problems. Preprocessing transforms structure.',
    interview:'Preprocessing is getting the data ready for the model. Cleaning fixes problems. Preprocessing transforms the format. For example, converting text categories to numbers, or scaling all numbers to the same range so the model treats all features equally.',
    code:'from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import (\n    StandardScaler, OneHotEncoder)',
    realworld:'Netflix preprocesses user interaction data before feeding it to their recommendation model. Watch history is encoded as vectors, ratings are normalised, and categorical genres are one-hot encoded. Without preprocessing the model cannot process the mixed data types.' },

  { id:'pp_02', topic:'Data Preprocessing', subtopic:'Label Encoding',
    theory:'Label encoding assigns each category an integer: Male=0, Female=1. Simple and works for tree-based models. Not good for linear models because they may assume false mathematical ordering — Male < Female implies Female is greater which is meaningless for a category.',
    interview:'Label encoding converts text categories into numbers. Male becomes 0, Female becomes 1. Works fine for tree models. But for linear models it is a problem because the model might think one category is mathematically greater than another, which does not make sense.',
    code:'from sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\ndf[\"gender_enc\"] = le.fit_transform(df[\"gender\"])',
    realworld:'A telecom churn model has a "contract_type" column: Monthly, Yearly, Two-Year. Label encoding gives 0, 1, 2. A Random Forest handles this fine. But Logistic Regression wrongly assumes Two-Year is twice as important as Yearly based on the numbers — a false assumption.' },

  { id:'pp_03', topic:'Data Preprocessing', subtopic:'One-Hot Encoding',
    theory:'One-hot converts each category into a separate binary column. A column with Red, Green, Blue becomes three columns. Each row gets a 1 in the matching column and 0 in the rest. Avoids false ordering from label encoding. Problem: too many unique categories creates too many columns — high cardinality problem.',
    interview:'One-hot encoding creates a new column for each category. If a column has Red, Green, Blue we get three columns. Each row gets a 1 in the right column and 0 in the others. The model does not think one is greater than another.',
    code:'pd.get_dummies(df, columns=[\"color\"], drop_first=True)\n# or sklearn:\nfrom sklearn.preprocessing import OneHotEncoder\nohe = OneHotEncoder(sparse_output=False, drop=\"first\")',
    realworld:'A credit scoring model has a "city" column with 5 cities. One-hot creates 5 binary columns. Each customer has a 1 in their city column and 0 elsewhere. Logistic Regression can now treat each city independently without assuming any city is numerically greater than another.' },

  { id:'pp_04', topic:'Data Preprocessing', subtopic:'Standard Scaling',
    theory:'Transforms each feature to mean=0 and std=1. Critical for Linear Regression, SVM, KNN that are sensitive to feature scale. Without scaling, a feature with values in thousands dominates one between 0 and 1. Rule: fit on training data only, then transform both train and test. Fitting on test causes data leakage.',
    interview:'Standard scaling makes all features have the same scale — mean 0 and standard deviation 1. Without this, the model pays more attention to columns with big numbers. We fit the scaler only on training data. If we fit on test data too, we are leaking future information.',
    code:'from sklearn.preprocessing import StandardScaler\nsc = StandardScaler()\nX_train = sc.fit_transform(X_train)\nX_test  = sc.transform(X_test)  # NOT fit_transform!',
    realworld:'A loan approval model has two features: annual_income (around 500,000) and credit_score (around 750). Without scaling, the model treats income as far more important just because of magnitude. StandardScaler brings both to the same scale so the model evaluates them fairly.' },

  { id:'pp_05', topic:'Data Preprocessing', subtopic:'Min-Max Normalisation',
    theory:'Scales values to [0,1] using (x - min)/(max - min). Preserves distribution shape. Useful for neural networks and image pixel values. Sensitive to outliers because extreme values pull the min and max, squashing everything else into a small range. Remove outliers first.',
    interview:'Min-max normalisation shrinks all values to between 0 and 1. It is useful for neural networks. The problem is if there are outliers, they pull the min and max so everything else gets squashed into a small range. That is why we remove outliers first.',
    code:'from sklearn.preprocessing import MinMaxScaler\nmms = MinMaxScaler()\nX_train = mms.fit_transform(X_train)\nX_test  = mms.transform(X_test)',
    realworld:'An image classification model requires pixel values between 0 and 1. Raw images have values from 0 to 255. Dividing by 255 normalises all pixels to 0-1. Neural networks train much faster and more stably with this normalised input.' },

  { id:'pp_06', topic:'Data Preprocessing', subtopic:'Data Leakage',
    theory:'Leakage: information from outside training data leaks in, making the model look better than it is. Most common mistake: fitting the scaler on the full dataset before splitting. The test set simulates unseen data. If the scaler already saw it, evaluation is dishonest. Always split first, then fit preprocessing on train only.',
    interview:'Data leakage means the model accidentally sees test data during training. This makes accuracy look very high but the model fails in real life. Always split first, then fit the scaler only on training data.',
    code:'# WRONG: leaks test data into scaler\nX_scaled = scaler.fit_transform(X)\nX_tr, X_te = train_test_split(X_scaled)\n\n# CORRECT:\nX_tr, X_te = train_test_split(X)\nX_tr = scaler.fit_transform(X_tr)\nX_te = scaler.transform(X_te)',
    realworld:'A data scientist builds a stock prediction model and gets 95% accuracy. But the scaler was fit on all data including test data — the model saw future prices when learning the scale. In production it performs terribly. This is a classic leakage mistake in competitions and real projects.' },

  { id:'pp_07', topic:'Data Preprocessing', subtopic:'Train-Test Split',
    theory:'Split into training (to learn from) and test (to evaluate on). Common: 80/20. Test set must not be seen during training. random_state ensures reproducibility. stratify=y keeps same class balance in both splits — important for imbalanced datasets like fraud detection.',
    interview:'We split data into two parts. Training is what the model learns from. Test is what we use to check performance on data it has never seen. We use random_state so the split is the same every time, making results reproducible.',
    code:'from sklearn.model_selection import train_test_split\nX_tr, X_te, y_tr, y_te = train_test_split(\n    X, y, test_size=0.2,\n    random_state=42, stratify=y)',
    realworld:'A spam classifier is trained on 80% of emails and tested on 20%. stratify=y ensures both splits have the same spam-to-not-spam ratio. Without stratify, the test set might have very few spam examples and give misleadingly optimistic accuracy scores.' },

  // FEATURE ENGINEERING
  { id:'fe_01', topic:'Feature Engineering', subtopic:'Definition',
    theory:'Feature engineering creates new input variables from existing data to help the model learn better. Raw data often lacks the most useful signals. By creating features that capture relationships and patterns, we give the model better information. Good feature engineering often improves performance more than choosing a fancier algorithm.',
    interview:'Feature engineering means creating new columns from existing ones that are more useful for the model. For example, instead of giving the model a raw date, we extract month, day of week, or whether it is a holiday. These new features help the model find patterns it could not see in the raw data.',
    code:'# Simple derived features\ndf[\"age\"] = 2024 - df[\"birth_year\"]\ndf[\"price_per_sqft\"] = df[\"price\"] / df[\"area\"]',
    realworld:'Airbnb engineers create features like "days_since_last_review", "price_per_room", and "host_response_rate" from raw booking and listing data. These engineered features are more predictive of booking success than the raw columns alone.' },

  { id:'fe_02', topic:'Feature Engineering', subtopic:'Derived Features',
    theory:'New columns calculated from existing ones. Extract year/month/day from dates. Create price-per-unit from price and quantity. Calculate age from date of birth. These often carry more predictive power because they represent meaningful concepts the model can directly use.',
    interview:'Derived features are new columns we calculate from existing ones. From a date we can extract month or day of week. From price and quantity we can calculate price per unit. These new columns often help the model more because they directly represent something meaningful.',
    code:'df[\"year\"]  = df[\"date\"].dt.year\ndf[\"month\"] = df[\"date\"].dt.month\ndf[\"dow\"]   = df[\"date\"].dt.dayofweek\ndf[\"ratio\"] = df[\"col_a\"] / df[\"col_b\"]',
    realworld:'A food delivery app extracts "hour_of_day" and "is_weekend" from raw order timestamps. The model learns that orders spike at lunchtime and on weekends — a pattern it could not find from a raw timestamp alone.' },

  { id:'fe_03', topic:'Feature Engineering', subtopic:'Lag Features',
    theory:'Used in time-series. Lag-1 = value from previous time step. Lag-7 = 7 steps ago. Past values are often the best predictors of future values. LSTM models learn these automatically but lag features help simpler models. After shifting, first rows will have NaN — drop them.',
    interview:'Lag features use past values to predict the future. Yesterday\'s stock price is a useful input for predicting today\'s price. We create this by shifting the column by one row. After shifting, the first rows will be empty so we drop them.',
    code:'df[\"lag_1\"]  = df[\"value\"].shift(1)\ndf[\"lag_7\"]  = df[\"value\"].shift(7)\ndf[\"lag_30\"] = df[\"value\"].shift(30)\ndf.dropna(inplace=True)  # shift creates NaN',
    realworld:'A weather forecasting model uses yesterday\'s temperature (lag-1) and temperature from 7 days ago (lag-7) as features. These lag features capture both short-term trends and weekly patterns, significantly improving next-day temperature predictions.' },

  { id:'fe_04', topic:'Feature Engineering', subtopic:'Rolling / Window Features',
    theory:'Compute statistics over a moving window of recent values. 7-day rolling mean = average of last 7 values. Rolling std = volatility over recent period. Smooths out noise and captures recent trends. Very useful in time-series and financial data. First few rows will have NaN — drop them.',
    interview:'Rolling features calculate statistics over a window of recent rows. The 7-day rolling average shows the recent trend. Rolling standard deviation shows how much values are jumping around. Very common in stock market and sales forecasting projects.',
    code:'df[\"roll_mean_7\"] = df[\"val\"].rolling(7).mean()\ndf[\"roll_std_30\"] = df[\"val\"].rolling(30).std()\ndf[\"roll_max_7\"]  = df[\"val\"].rolling(7).max()\ndf.dropna(inplace=True)',
    realworld:'Amazon uses 7-day and 30-day rolling averages of product views and purchases as features in their demand forecasting model. The rolling average smooths out daily noise and gives the model a cleaner picture of actual demand trends.' },

  { id:'fe_05', topic:'Feature Engineering', subtopic:'Target Encoding',
    theory:'Replace each category with the mean target value for that category. More powerful than one-hot for high-cardinality columns. Risk: data leakage if computed on all data before splitting. Compute encoding on train set only, then map to test. Prevents the encoding from seeing test labels.',
    interview:'Target encoding replaces a category with the average of the target for that category. For example, replace each city name with the average house price in that city. Very useful when a column has too many unique values for one-hot encoding. But we must compute it on training data only to avoid leakage.',
    code:'# Compute on train only\nenc = X_train.groupby(\"city\")[\"target\"].mean()\nX_train[\"city_enc\"] = X_train[\"city\"].map(enc)\nX_test[\"city_enc\"]  = X_test[\"city\"].map(enc)',
    realworld:'A real estate model has a "neighbourhood" column with 500 unique values. One-hot would create 500 columns. Target encoding replaces each neighbourhood with its average sale price from training data — one column, very informative for the model.' },

  { id:'fe_06', topic:'Feature Engineering', subtopic:'Aggregation Features',
    theory:'Summarise data from multiple rows into one value per group. For each customer: total purchases, average order value, order count. Turns transaction-level data into customer-level features. GroupBy is the main tool. Very common in industry projects.',
    interview:'Aggregation features summarise data per group. For each customer we calculate total spend, average order value, and number of orders using groupby. A customer might have hundreds of transactions but we summarise that into a few meaningful numbers for the model.',
    code:'agg = df.groupby(\"customer_id\").agg(\n    total_spend = (\"amount\", \"sum\"),\n    avg_order   = (\"amount\", \"mean\"),\n    order_count = (\"order_id\", \"count\")\n).reset_index()\ndf = df.merge(agg, on=\"customer_id\")',
    realworld:'A bank\'s fraud model aggregates per customer: total transactions in last 30 days, average transaction amount, maximum single transaction. A sudden spike in transaction count compared to the customer\'s average is a strong fraud signal.' },

  { id:'fe_07', topic:'Feature Engineering', subtopic:'Feature Selection',
    theory:'Remove features that do not help or actively hurt the model. Too many features causes overfitting, curse of dimensionality, and slower training. Methods: correlation matrix, feature importance from tree models, SelectKBest statistical tests. Goal: smaller set of high-quality features.',
    interview:'Feature selection is choosing which columns to keep and which to remove. Not all features are useful — some are noise, some are too similar to each other. We use a correlation matrix to find redundant features, or train a Random Forest to see which features it used most.',
    code:'corr = df.corr()\nfrom sklearn.ensemble import RandomForestClassifier\nrf = RandomForestClassifier()\nrf.fit(X_train, y_train)\nimportances = rf.feature_importances_',
    realworld:'A credit risk model starts with 150 features. Many are highly correlated — like annual_income and monthly_income. Feature selection removes redundant ones, dropping to 40 features. The model trains faster, is easier to explain to regulators, and performs just as well.' },

  // STATISTICAL ANALYSIS
  { id:'sa_01', topic:'Statistical Analysis', subtopic:'Definition',
    theory:'Uses math and statistics to understand data, find patterns, test assumptions, and draw conclusions. Helps understand distributions, relationships between variables, and whether patterns are real or random noise. Foundation of EDA and data-driven decision making.',
    interview:'Statistical analysis is using numbers and math to understand what the data is telling us. We look at averages, spread, and relationships between columns. It helps us decide how to clean data, which features to use, and whether our model results are real or just random chance.',
    code:'df.describe()\ndf[\"col\"].mean()\ndf[\"col\"].median()\ndf[\"col\"].std()\ndf[\"col\"].skew()',
    realworld:'Before launching a new product feature, a tech company runs statistical analysis on user behaviour data. They check usage distributions, test whether the new feature increases engagement more than chance, and measure correlation between feature use and retention.' },

  { id:'sa_02', topic:'Statistical Analysis', subtopic:'Distributions',
    theory:'A distribution shows how values are spread. Normal (bell curve) is symmetric. Skewed distributions have a long tail on one side. Understanding distribution helps decide how to handle outliers, which scaling to use, and which statistical tests are valid. Check with histograms and box plots.',
    interview:'Distribution shows how values are spread. The normal distribution looks like a bell curve — most values in the middle, fewer on the sides. Some data is skewed with a long tail on one side. We check distribution using a histogram. This tells us how to treat the data.',
    code:'df[\"col\"].hist(bins=30)\nimport matplotlib.pyplot as plt\nplt.show()\nprint(df[\"col\"].skew())   # asymmetry\nprint(df[\"col\"].kurt())   # tail thickness',
    realworld:'A salary analytics team plots the distribution of employee salaries and sees a right skew — most cluster around 60k but a few executives earn over 500k. This tells them to use median not mean in reports, and to apply log transformation before building a salary prediction model.' },

  { id:'sa_03', topic:'Statistical Analysis', subtopic:'Variance and Std Deviation',
    theory:'Variance = average of squared differences from mean. Std dev = square root of variance, in same unit as data. High std: values spread out. Low std: values cluster near mean. In ML, high variance in a model = overfitting — great on training, poor on test.',
    interview:'Standard deviation measures how spread out the data is. If all salaries are close to 50000 the std dev is small. If they range widely it is large. In machine learning, high variance means the model performs great on training data but badly on new data — called overfitting.',
    code:'var  = df[\"col\"].var()\nstd  = df[\"col\"].std()\nmean = df[\"col\"].mean()\n# 68% of data within 1 std dev (normal dist)\n# 95% within 2 std devs',
    realworld:'A manufacturing quality team monitors product weight. Target is 100g with allowed std dev of 2g. If std dev exceeds 2g the production line is flagged. This statistical control keeps products within acceptable range and detects machine problems early.' },

  { id:'sa_04', topic:'Statistical Analysis', subtopic:'Hypothesis Testing',
    theory:'Decide whether a result is real or happened by chance. H0 = null hypothesis (no effect). If p-value < 0.05, reject H0 — result is statistically significant. Common tests: t-test (compare two group means), chi-square (compare categorical distributions). Used heavily in A/B testing.',
    interview:'Hypothesis testing helps us decide if a difference we see is real or just random chance. We state a null hypothesis saying there is no difference. Then we calculate a p-value. If it is less than 0.05, the difference is real. This is used a lot in A/B testing.',
    code:'from scipy import stats\nt, p = stats.ttest_ind(group_a, group_b)\nif p < 0.05:\n    print(\"Significant difference\")\nelse:\n    print(\"Not significant\")',
    realworld:'An e-commerce company tests two checkout page designs. Group A gets the old design, Group B the new one. A t-test on conversion rates gives p=0.02 — less than 0.05. The company concludes the new design genuinely improves conversions and rolls it out to all users.' },

  { id:'sa_05', topic:'Statistical Analysis', subtopic:'Correlation',
    theory:'Measures strength and direction of linear relationship. Pearson: -1 to +1. +1 = perfect positive (both go up), -1 = perfect negative, 0 = no linear relationship. Key: correlation does not mean causation. Two things can move together without one causing the other.',
    interview:'Correlation measures how two columns move together. Close to 1 means same direction. Close to -1 means opposite directions. Close to 0 means no relationship. We use this in feature selection to find similar columns. Remember: correlation does not mean one causes the other.',
    code:'corr = df.corr()\nfrom scipy.stats import pearsonr\nr, p = pearsonr(df[\"a\"], df[\"b\"])\n# Spearman (rank-based, handles non-linear)\nfrom scipy.stats import spearmanr\nr, p = spearmanr(df[\"a\"], df[\"b\"])',
    realworld:'Ice cream sales and drowning deaths are correlated — both increase in summer, not because one causes the other but because both are driven by hot weather. This classic example of correlation without causation gets asked in almost every data science interview.' },

  { id:'sa_06', topic:'Statistical Analysis', subtopic:'Mean, Median, Mode',
    theory:'Mean: average, affected by outliers. Median: middle value when sorted, not affected by outliers. Mode: most frequent value. In skewed data, median better represents the typical value. A few billionaires pull the mean income up, but median represents the typical person.',
    interview:'Mean is the average. Median is the middle value. Mode is the most common value. When data has outliers the mean gets pulled towards them and does not represent most people. The median is better in that case. In missing value imputation we fill with median not mean for this reason.',
    code:'mean   = df[\"col\"].mean()\nmedian = df[\"col\"].median()\nmode   = df[\"col\"].mode()[0]\n# Skewed data -> use median\n# Categorical  -> use mode\n# Imputation   -> median (safer)',
    realworld:'A government report on household income uses median income not mean. A few thousand billionaires would push the mean income very high. The median income gives a much more accurate picture of what most households actually earn. News articles about income always use median for this reason.' },

  // PANDAS
  { id:'pd_01', topic:'Pandas', subtopic:'Definition',
    theory:'Pandas provides Series (1D labelled array) and DataFrame (2D table). Almost all data science work uses pandas for loading, cleaning, exploring, and transforming data before feeding to a model. Built on top of NumPy for performance.',
    interview:'Pandas is the main Python library for working with data in tables. Think of it like Excel but in code. We use it to load data, clean it, filter it, group it, and prepare it for models. The main thing we work with is a DataFrame which is basically a table with rows and columns.',
    code:'import pandas as pd\ndf = pd.read_csv(\"data.csv\")\ndf.head()\ndf.shape\ndf.info()\ndf.describe()',
    realworld:'Every data science team uses pandas as the first step in any project. A data analyst at Swiggy loads daily order data into a DataFrame, cleans it, groups by city and restaurant, and creates a summary table to share with the business team — all in under 50 lines of code.' },

  { id:'pd_02', topic:'Pandas', subtopic:'Filtering and Selecting',
    theory:'Select one column: df["col"]. Multiple: df[["col1","col2"]]. Filter rows with conditions. loc[] uses labels, iloc[] uses integer positions. Boolean indexing with & (and), | (or). Parentheses required around each condition when using & or |.',
    interview:'Filtering means keeping only rows that match a condition. Like all rows where age is greater than 30. loc is used to select by column name, iloc is used to select by column number. We use these operations constantly in every project.',
    code:'df[\"name\"]\ndf[[\"name\",\"age\"]]\ndf[df[\"age\"] > 30]\ndf[(df[\"age\"]>30) & (df[\"city\"]==\"HYD\")]\ndf.loc[0:5, \"name\"]\ndf.iloc[0:5, 0]',
    realworld:'A data analyst at a bank filters transaction data: keep only transactions from the last 30 days, amount greater than 10000, and type is DEBIT. This filtering gives exactly the subset needed to investigate fraud cases without writing any SQL.' },

  { id:'pd_03', topic:'Pandas', subtopic:'GroupBy',
    theory:'Split-apply-combine pattern. Split data into groups, apply function to each group, combine results. Equivalent to SQL GROUP BY. Multiple aggregations with .agg() in one call. reset_index() converts grouped result back to a regular DataFrame.',
    interview:'GroupBy splits data into groups and applies a function to each group. For example, group by city and calculate average salary in each city. It is exactly like SQL GROUP BY. We get one row per group in the output.',
    code:'df.groupby(\"region\")[\"sales\"].sum()\ndf.groupby(\"region\").agg(\n    total = (\"sales\", \"sum\"),\n    avg   = (\"sales\", \"mean\"),\n    count = (\"sales\", \"count\")\n)',
    realworld:'A retail analytics team uses groupby to calculate total revenue, average basket size, and number of transactions per store location. This gives management a performance comparison across all 200 stores in a single line of code.' },

  { id:'pd_04', topic:'Pandas', subtopic:'Merge and Join',
    theory:'Merge combines DataFrames by matching rows on a common column — equivalent to SQL JOIN. INNER: only matching rows. LEFT: all from left, matching from right (NaN where no match). Most common in data work: LEFT JOIN to keep all records from main table.',
    interview:'Merge combines two tables using a common column. Like joining a customer table with an orders table on customer ID. Inner merge keeps only rows that exist in both tables. Left merge keeps all rows from the left table even if there is no match.',
    code:'pd.merge(df1, df2, on=\"id\")             # inner\npd.merge(df1, df2, on=\"id\", how=\"left\")  # left\npd.merge(df1, df2, on=[\"id\",\"date\"])',
    realworld:'An e-commerce analyst merges three tables: customers, orders, and products. Left merge on customer_id ensures all customers appear even if they have not ordered yet — these are leads the marketing team can target.' },

  { id:'pd_05', topic:'Pandas', subtopic:'Apply Function',
    theory:'apply() runs a custom function on each row or column. axis=0 = column-wise, axis=1 = row-wise. Use when built-in functions are insufficient for the required logic. Can be slow on large data — prefer vectorised operations when possible.',
    interview:'Apply runs a function on each row or column. When built-in functions are not enough, we write our own and use apply to run it across the data. Apply is flexible but slower than vectorised operations on large data.',
    code:'df[\"col\"].apply(lambda x: x * 2)\ndf.apply(lambda row: row[\"a\"]+row[\"b\"],\n          axis=1)\ndef classify(x): return \"high\" if x>100 else \"low\"\ndf[\"cat\"] = df[\"val\"].apply(classify)',
    realworld:'A risk team applies a custom scoring function to each loan application row. The function checks income, credit score, and employment type together and returns a risk category. This business logic cannot be expressed in a single pandas operation so apply() is the right choice.' },

  { id:'pd_06', topic:'Pandas', subtopic:'Handling Missing with Pandas',
    theory:'isnull() returns boolean mask. isnull().sum() counts missing per column. fillna() fills with value or method — ffill (copy previous row), bfill (copy next row). dropna() removes rows or columns with missing values. subset= specifies which columns to check.',
    interview:'Pandas has simple functions for missing values. isnull().sum() tells us how many are missing per column. fillna() fills them with a specific value like the median. dropna() removes rows with missing values. ffill copies the previous row\'s value — useful for time-series.',
    code:'df.isnull().sum()\ndf[\"col\"].fillna(df[\"col\"].median())\ndf.fillna(method=\"ffill\")  # forward fill\ndf.dropna(subset=[\"col\"])',
    realworld:'A sensor data pipeline receives temperature readings every minute. Occasionally sensors miss a reading. The team uses ffill to fill missing minutes with the last known reading. This keeps the time-series continuous without introducing fake values from a global average.' },

  // NUMPY
  { id:'np_01', topic:'NumPy', subtopic:'Definition',
    theory:'Core Python library for numerical computing. ndarray is much faster than Python lists for math operations. Almost all data science libraries (pandas, scikit-learn, TensorFlow) use NumPy internally. Operations implemented in C code — dramatically faster than pure Python.',
    interview:'NumPy is the library that does fast math in Python. It stores data in arrays which are like lists but much faster. Almost every data science library uses NumPy under the hood. When we do operations on a NumPy array it runs in C code which is many times faster than a Python loop.',
    code:'import numpy as np\na = np.array([1, 2, 3, 4, 5])\nprint(a.shape)   # (5,)\nprint(a.dtype)   # int64\nprint(a.mean())  # 3.0',
    realworld:'TensorFlow and PyTorch store all model weights and input data as NumPy-like arrays. When you call model.predict(), the inputs are processed through C/CUDA code at high speed. The speed of NumPy operations is what makes large-scale ML training practically possible.' },

  { id:'np_02', topic:'NumPy', subtopic:'Arrays and Shapes',
    theory:'Arrays can be 1D (vector), 2D (matrix), or higher. Shape tells dimensions — (100, 5) = 100 rows, 5 cols. reshape() changes shape without changing data. Shapes must match exactly in deep learning for operations to work. -1 in reshape means "calculate this dimension automatically".',
    interview:'NumPy arrays have a shape which tells us rows and columns. Shape (100, 5) means 100 rows and 5 columns. We use reshape to change the dimensions. This is very important in deep learning where the input to each layer must have a specific shape.',
    code:'a = np.array([[1,2,3],[4,5,6]])\nprint(a.shape)     # (2, 3)\nprint(a.ndim)      # 2\na.reshape(3, 2)\na.reshape(1, -1)   # (1, 6) auto-calc\na.flatten()        # (6,) 1D',
    realworld:'A CNN model expects input shape (batch_size, height, width, channels). When loading images they come in as (height, width, channels). The pipeline uses np.expand_dims to add the batch dimension, changing (224,224,3) to (1,224,224,3) for single image prediction.' },

  { id:'np_03', topic:'NumPy', subtopic:'Broadcasting',
    theory:'Perform operations on arrays of different shapes without making copies. NumPy automatically expands the smaller array to match the larger one. Used extensively in deep learning for operations like adding bias to every sample in a batch.',
    interview:'Broadcasting means NumPy can do math between arrays of different sizes without writing loops. If we add a small array to a big array, NumPy automatically repeats the small one to match the size of the big one. This saves code and is very fast.',
    code:'a = np.array([[1,2,3],[4,5,6]])\nb = a + 10          # adds 10 to every element\nrow = np.array([1,2,3])\nc = a + row         # adds [1,2,3] to each row',
    realworld:'During neural network training, bias is a 1D array of shape (64,). The layer output is (batch_size, 64). NumPy broadcasts the bias across all rows of the batch automatically. Without broadcasting you would need an explicit loop over every sample in the batch.' },

  { id:'np_04', topic:'NumPy', subtopic:'Vectorisation',
    theory:'Write code that operates on entire arrays at once. NumPy operations run in optimised C code — 100x faster than Python loops. Avoid for loops and use NumPy functions directly on arrays. This is the standard way to write fast numerical Python code.',
    interview:'Vectorisation means doing operations on the whole array at once instead of using a loop. A Python loop on a million numbers is very slow. NumPy does it in C code which is maybe 100 times faster. So instead of writing a loop we write data squared and NumPy handles all elements automatically.',
    code:'# SLOW: Python loop\nresult = [x**2 for x in data]\n\n# FAST: vectorised NumPy\ndata   = np.array(data)\nresult = data ** 2\nnp.sqrt(data)\nnp.log(data)',
    realworld:'A data pipeline processes 10 million sensor readings per day. Using a Python loop to normalise each reading takes 45 seconds. Switching to NumPy vectorised operations brings this down to 0.3 seconds. This 150x speedup makes the difference between a real-time system and a batch backlog.' },

  { id:'np_05', topic:'NumPy', subtopic:'Slicing and Indexing',
    theory:'2D slicing: arr[row, col] or arr[row_start:row_end, col_start:col_end]. Boolean indexing filters elements based on condition — fast and avoids loops. In image processing a colour image is (height, width, 3) and channels are extracted with slicing.',
    interview:'Slicing in NumPy lets us pick specific rows and columns using row and column indices separated by a comma. We can also use ranges. Boolean indexing filters values based on a condition like getting all elements greater than 5.',
    code:'a = np.array([[1,2,3],[4,5,6],[7,8,9]])\na[0]          # first row: [1,2,3]\na[:, 1]       # second col: [2,5,8]\na[0:2, 1:3]   # submatrix\na[a > 5]      # boolean: [6,7,8,9]',
    realworld:'In image processing a colour image is stored as a 3D NumPy array of shape (height, width, 3). To extract the red channel: image[:, :, 0]. To crop a region: image[100:200, 150:250, :]. These slicing operations are fundamental to every computer vision pipeline.' },

  { id:'np_06', topic:'NumPy', subtopic:'Useful NumPy Functions',
    theory:'Built-in functions operate element-wise or along axes. axis=0 = down each column. axis=1 = across each row. Common: mean, sum, std, min, max, argmax, where (conditional selection), zeros, ones, linspace, random.randn.',
    interview:'NumPy has many built-in math functions. The axis parameter tells it which direction — axis 0 goes down columns, axis 1 goes across rows. We also use np.zeros to initialise empty arrays and np.random to create random data for testing.',
    code:'a = np.array([[1,2,3],[4,5,6]])\nnp.sum(a)            # 21\nnp.sum(a, axis=0)    # [5,7,9] col sums\nnp.sum(a, axis=1)    # [6,15]  row sums\nnp.argmax(a)\nnp.where(a>3, 1, 0)\nnp.zeros((3,3))',
    realworld:'A deep learning researcher initialises model weights using np.random.randn() for normal distribution and np.zeros() for bias. During evaluation they use np.argmax() to convert raw model output scores into predicted class labels — the class with the highest score wins.' },
];
