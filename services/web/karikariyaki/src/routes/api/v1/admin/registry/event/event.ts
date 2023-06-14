import { Router } from "express";

// Services
import { EventService, RequestService, ResponseService } from "@services";

// Types
import { EventErrors } from "@models";
import { InHouseError } from "@types";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const foundEvents = await EventService.query({
            id: RequestService.queryParamToString(req.query.id),
            name: RequestService.queryParamToString(req.query.name),
            date: RequestService.queryParamToDate(req.query.date),
            isOpen: RequestService.queryParamToBoolean(req.query.isOpen),
        });

        res.status(200).json(
            ResponseService.generateSucessfulResponse(foundEvents)
        );
    } catch (error) {
        res.status(error.code ?? 500).json(
            ResponseService.generateFailedResponse(error.message)
        );
    }
});

router.post("/", async (req, res) => {
    try {
        const name = req.body.name;
        const date = RequestService.queryParamToDate(req.body.date);
        const isOpen = RequestService.queryParamToBoolean(req.body.isOpen);

        if (!name || !date) {
            throw new InHouseError(EventErrors.INVALID, 400);
        }

        const response = await EventService.save({
            name: name,
            date: date,
            isOpen: isOpen,
        });

        res.status(200).json(
            ResponseService.generateSucessfulResponse(response)
        );
    } catch (error) {
        res.status(error.code ?? 500).json(
            ResponseService.generateFailedResponse(error.message)
        );
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const isOpen = RequestService.queryParamToBoolean(req.body.isOpen);

        if (!id) {
            throw new InHouseError(EventErrors.INVALID, 400);
        }

        const response = await EventService.update(id, {
            name: name,
            isOpen: isOpen,
        });

        res.status(200).json(
            ResponseService.generateSucessfulResponse(response)
        );
    } catch (error) {
        res.status(error.code ?? 500).json(
            ResponseService.generateFailedResponse(error.message)
        );
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            throw new InHouseError(EventErrors.INVALID, 400);
        }

        const response = await EventService.delete(id);

        if (!response) {
            throw new InHouseError(EventErrors.NOT_FOUND, 404);
        }

        res.status(200).json(
            ResponseService.generateSucessfulResponse(response)
        );
    } catch (error) {
        res.status(error.code ?? 500).json(
            ResponseService.generateFailedResponse(error.message)
        );
    }
});

export default router;
