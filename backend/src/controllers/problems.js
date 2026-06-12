import { getProblems } from '../service/problemService.js';

export async function getProblemsController(req, res, next) {
    try {
        const problems = await getProblems();

        console.log("fetching problems");
        res.json(problems);
    } catch (error) {
        next(error);
    }
}
