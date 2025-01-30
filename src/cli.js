import inquirer from "inquirer";
import { pool } from './connection.js';

class Cli {
    exit = false;

    /*
    Inquirer functions:
    */
    performActions() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Pick a database action:',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update employee role',
                    'Quit'
                ]
            }
        ])
        .then(async (answers) => {
            if (answers.action === 'View all departments') {
                await this.showDepartments();
                this.performActions();
            }
            else if (answers.action === 'View all roles') {
                await this.showRoles();
                this.performActions();
            }
            else if (answers.action === 'View all employees') {
                await this.showEmployees();
                this.performActions();
            }
            else if (answers.action === 'Add a department') {
                this.createDepartment();
            }
            else if (answers.action === 'Add a role') {
                this.createRole();
            }
            else if (answers.action === 'Add an employee') {
                this.createEmployee();
            }
            else if (answers.action === 'Update employee role') {
                this.updateRole();
            }
            else {
                this.exit = true;
                pool.end();
                process.exit();
            }
        })
    }

    createDepartment() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'deptName',
                message: 'Enter department name:',
            }
        ])
        .then(async (answers) => {
            await this.insertDepartment(answers.deptName);
            await this.showDepartments();
            this.performActions();
        })
    }

    async createEmployee() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter employee first name:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter employee last name:',
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select employee role:',
                choices: (await this.getRoles()).map((result) => {
                    return {
                        name: `${result.title}`,
                        value: result.id
                    }
                })
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Select employee manager:',
                choices: (await this.getEmployees()).map((result) => {
                    return {
                        name: `${result.first_name} ${result.last_name}`,
                        value: result.id
                    }
                })
            }
        ])
        .then(async (answers) => {
            await this.insertEmployee(answers.firstName, answers.lastName, answers.roleId, answers.managerId);
            await this.showEmployees();
            this.performActions();
        })
    }

    async createRole() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter role title:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter role salary:',
            },
            {
                type: 'list',
                name: 'deptId',
                message: 'Select the department:',
                choices: (await this.getDepartments()).map((result) => {
                    return {
                        name: `${result.name}`,
                        value: result.id
                    }
                })
            }
        ])
        .then(async (answers) => {
            await this.insertRole(answers.title, answers.salary, answers.deptId);
            await this.showRoles();
            this.performActions();
        })
    }

    async updateRole() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select employee to update:',
                choices: (await this.getEmployees()).map((result) => {
                    return {
                        name: `${result.first_name} ${result.last_name}`,
                        value: result.id
                    }
                })
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select their new role:',
                choices: (await this.getRoles()).map((result) => {
                    return {
                        name: `${result.title}`,
                        value: result.id
                    }
                })
            }
        ])
        .then(async (answers) => {
            await this.updateEmployee(answers.employeeId, answers.roleId);
            await this.showEmployees();
            this.performActions();
        })
    }

    /*
    Query functions:
    */
    async updateEmployee(employeeId, roleId) {
        const sql =
            `UPDATE employee 
            SET role_id = $1
            WHERE id = $2`;
        const params = [roleId, employeeId];

        await pool.query(sql, params);
    }

    async insertEmployee(firstName, lastName, roleId, managerId) {
        const sql =
            `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4)`;
        const params = [firstName, lastName, roleId, managerId];

        await pool.query(sql, params);
    }

    async insertRole(title, salary, deptId) {
        const sql =
            `INSERT INTO role (title, salary, department_id)
            VALUES ($1, $2, $3)`;
        const params = [title, salary, deptId];

        await pool.query(sql, params);
    }

    async insertDepartment(name) {
        const sql =
            `INSERT INTO department (name)
            VALUES ($1)`;
        const params = [name];

        await pool.query(sql, params);
    }

    async getDepartments() {
        const sql =
            `SELECT * 
            FROM department`;
        const result = await pool.query(sql);
        return result.rows;
    }

    async getRoles() {
        const sql =
            `SELECT * 
            FROM role`;
        const result = await pool.query(sql);
        return result.rows;
    }

    async getEmployees() {
        const sql =
            `SELECT * 
            FROM employee`;
        const result = await pool.query(sql);
        return result.rows;
    }

    async showDepartments() {
        const resultRows = await this.getDepartments();
        console.table(resultRows);
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