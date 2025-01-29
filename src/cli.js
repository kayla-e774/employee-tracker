import inquirer from "inquirer";
import { pool } from './connection.js';

class Cli {
    exit = false;

    performActions() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Quit'
                ]
            }
        ])
        .then(async (answers) => {
            if (answers.action === 'View all departments') {
                await this.showDepartments();
            }
            else if (answers.action === 'View all roles') {
                await this.showRoles();
            }
            else if (answers.action === 'View all employees') {
                await this.showEmployees();
            }
            else {
                this.exit = true;
            }

            if(!this.exit) {
                this.performActions();
            }
        })
    }

    async showDepartments() {
        const sql = 
            `SELECT * 
            FROM department`;
        const result = await pool.query(sql);

        console.table(result.rows);
    }

    async showRoles() {
        const sql = 
            `SELECT r.id, r.title, d.name AS department, r.salary 
            FROM role AS r
            JOIN department AS d
            ON r.department_id = d.id`;
        const result = await pool.query(sql);

        console.table(result.rows);
    }

    async showEmployees() {
        const sql = 
            `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager 
            FROM employee AS e
            JOIN role AS r
            ON e.role_id = r.id
            JOIN department AS d
            ON r.department_id = d.id
            LEFT JOIN employee AS e2
            ON e.manager_id = e2.id`;
        const result = await pool.query(sql);

        console.table(result.rows);
    }
}

export default Cli;