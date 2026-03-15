export const parseCronExpression = (expr) => {
	if (!expr) return "Unknown schedule";

	const parts = expr.trim().split(" ");
	if (parts.length !== 5) return expr;

	const [minute, hour, day, month, weekday] = parts;

	// Every X minutes
	if (
		minute.startsWith("*/") &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		const interval = minute.replace("*/", "");
		return `Every ${interval} minute${interval === "1" ? "" : "s"}`;
	}

	// Hourly
	if (
		minute === "0" &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every hour";
	}

	// Daily
	if (day === "*" && month === "*" && weekday === "*") {
		return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	}

	// Weekly
	if (day === "*" && month === "*" && weekday !== "*") {
		const days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];

		const dayName = days[parseInt(weekday, 10)] || "Unknown day";

		return `Weekly on ${dayName} at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	}

	return expr;
};

export const parseCronExpressionToForm = (expr) => {
	const defaultForm = {
		scheduleType: "interval",
		interval: 5,
		time: "00:00",
		weekday: "1",
	};

	if (!expr) return defaultForm;

	const parts = expr.trim().split(" ");
	if (parts.length !== 5) return defaultForm;

	const [minute, hour, day, month, weekday] = parts;

	// Every X minutes
	if (
		minute.startsWith("*/") &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		const interval = parseInt(minute.replace("*/", ""), 10);
		return {
			scheduleType: "interval",
			interval: isNaN(interval) ? 5 : interval,
			time: "00:00",
			weekday: "1",
		};
	}

	// Hourly
	if (
		minute === "0" &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return {
			scheduleType: "hourly",
			interval: 5,
			time: "00:00",
			weekday: "1",
		};
	}

	// Daily
	if (day === "*" && month === "*" && weekday === "*") {
		return {
			scheduleType: "daily",
			interval: 5,
			time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
			weekday: "1",
		};
	}

	// Weekly
	if (day === "*" && month === "*" && weekday !== "*") {
		return {
			scheduleType: "weekly",
			interval: 5,
			time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
			weekday: weekday,
		};
	}

	return defaultForm;
};
