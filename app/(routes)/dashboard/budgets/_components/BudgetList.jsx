"use client"
import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import BudgetItem from './BudgetItem';

function BudgetList() {
    const [budgetList, setBudgetList] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            getBudgetList();
        }
    }, [user]);

    const getBudgetList = async () => {
        try {
            const result = await db.select({
                ...getTableColumns(Budgets),
                totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number)
            }).from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)) // Assuming this field exists
            .groupBy(Budgets.id)
            .orderBy(desc(Budgets.id));

            setBudgetList(result);
            // console.log(result);
        } catch (error) {
            console.error("Error fetching budget list:", error);
        }
    };

    return (
        <div className='mt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <CreateBudget refreshData={()=>getBudgetList()} />
                {budgetList?.length>0? budgetList.map((budget) => (
                    <BudgetItem key={budget.id} budget={budget} />
                )):[1,2,3,4,5,6].map((item,index)=>(
                    <div key={index} className='w-full bg-slate-100 rounded-lg h-[150p] animate-pulse' >
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BudgetList;
