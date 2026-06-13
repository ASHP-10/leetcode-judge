import { getProblemById, getProblems } from '../service/problemService.js';

export async function getProblemsController(req, res, next) {
    try {
        const problems = await getProblems();

        console.log("fetching problems");
        res.json(problems);
    } catch (error) {
        next(error);
    }
}

export async function getProblemByIdController(req, res, next) {
    try {
        const problem = await getProblemById(req.params.id);

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.json(problem);
    } catch (error) {
        next(error);
    }
}
