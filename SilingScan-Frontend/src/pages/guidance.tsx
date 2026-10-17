import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCurrentUser } from "../lib/auth";
import type { ScanResult } from "../lib/scan";

type StoredResult = {
  imageUrl: string;
  result: ScanResult;
};

const sampleScan: StoredResult = {
  imageUrl: "",
  result: {
    status: "Diseased",
    confidence: 0,
    summary:
      "This is an example care-plan preview for a possible leaf-spot concern. It is not an AI result or a diagnosis.",
    urgency: "Monitor the plant",
    recommendations: [
      "Check nearby leaves for changes and note whether the marks are spreading.",
      "Keep foliage dry and improve airflow around the plant.",
      "Ask a local agriculturist before applying any crop treatment.",
    ],
  },
};

const sampleDamageByDay = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  return {
    day,
    damage: Math.round(35 * (day / 30) ** 1.4),
  };
});

const GuidancePage = () => {
  const navigate = useNavigate();
  const [scan, setScan] = useState<StoredResult | null>(null);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    const stored = sessionStorage.getItem("silingScanResult");

    if (!stored) {
      setScan(sampleScan);
      setIsSample(true);
      return;
    }

    try {
      setScan(JSON.parse(stored) as StoredResult);
    } catch {
      sessionStorage.removeItem("silingScanResult");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!scan) {
    return null;
  }

  const preventionSteps =
    scan.result.status === "Healthy"
      ? [
          "Keep the soil evenly moist without overwatering.",
          "Monitor leaf color and plant growth weekly for early signs of stress.",
          "Use compost or a balanced chili fertilizer to support strong reproduction and fruit quality.",
        ]
      : scan.result.status === "Pending"
        ? [
            "Keep the soil evenly moist and avoid wetting the leaves.",
            "Check the plant and nearby crops regularly for visible changes.",
            "Keep a note of when you first noticed the symptoms for the agriculturist.",
          ]
        : [
          "Remove and discard infected leaves and fruits immediately to reduce spread.",
          "Improve spacing and airflow so leaves dry faster after rain or watering.",
          "Clean pruning tools and avoid moving infected plants near healthy ones.",
        ];

  const cureSteps =
    scan.result.status === "Healthy"
      ? [
          "Continue current care and keep nutrient levels balanced.",
          "Routine checking is enough while the crop remains healthy.",
          "Apply mulch and maintain good drainage to prevent later stress.",
        ]
      : scan.result.status === "Pending"
        ? [
            "No disease-specific treatment is recommended until the image is reviewed.",
            "Ask a local agriculturist to assess the uploaded plant photo.",
            "Follow product labels and local guidance if treatment is later recommended.",
          ]
        : [
          "Apply a recommended fungicide or bactericide following the label instructions.",
          "Use targeted treatment for affected areas, not the whole field unless needed.",
          "Repeat treatment as advised by the product and continue monitoring after application.",
        ];

  return (
    <div className="chili-page min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {isSample ? "Care plan preview · example only" : "Prevention & cure"}
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              What to do next
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(isSample ? "/crops" : "/result")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Back to result
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Scan another image
            </button>
          </div>
        </div>

        {isSample ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            This sample shows the kind of guidance that can appear after an
            image is uploaded. It is illustrative only; no photo has been
            analyzed and no disease has been diagnosed.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-emerald-100/60">
            {isSample ? (
              <div className="flex min-h-80 flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-amber-100 p-8 text-center">
                <span className="text-7xl" aria-hidden="true">🌶️</span>
                <h2 className="mt-5 text-xl font-bold text-slate-800">Uploaded plant photo preview</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">A real uploaded image will appear here when a scan is available.</p>
              </div>
            ) : (
              <img
                src={scan.imageUrl}
                alt="Uploaded chili plant"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-emerald-100/60">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Status
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {isSample
                  ? "Example: possible leaf spot"
                  : scan.result.status === "Pending"
                    ? "Awaiting diagnosis"
                    : scan.result.status}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {scan.result.summary}
              </p>
            </div>

            <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-lg shadow-amber-100/60">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
                    Example damage projection · no action taken
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Illustrative damage over 30 days
                  </h3>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">
                  35% example damage by day 30
                </span>
              </div>
              <div className="mt-5 h-72 w-full" role="img" aria-label="Illustrative bar chart showing example crop damage increasing over 30 days without action, ending at 35 percent. This is not a prediction.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleDamageByDay} margin={{ top: 12, right: 8, left: -16, bottom: 4 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(day: number) => day === 1 || day % 5 === 0 ? `Day ${day}` : ""}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 40]}
                      ticks={[0, 10, 20, 30, 40]}
                      tickFormatter={(value: number) => `${value}%`}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                    />
                    <Tooltip
                      labelFormatter={(day) => `Day ${day}`}
                      formatter={(value) => [`${value}%`, "Example damage"]}
                      cursor={{ fill: "#fef3c7", opacity: 0.5 }}
                    />
                    <Bar dataKey="damage" name="Example damage" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Day 1</span>
                <span>Day 30</span>
              </div>
              <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-950">
                Demo placeholder only: the daily percentages and 35% endpoint
                are illustrative, not based on research, an AI model, or the
                uploaded photo. They do not predict damage to this plant or a
                whole crop. A reliable estimate needs validated crop data and
                expert review.
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-lg font-bold text-emerald-900">
                  Prevention steps
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-950">
                  {preventionSteps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-lg font-bold text-amber-900">
                  Cure & treatment
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950">
                  {cureSteps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Recommended next step
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                {scan.result.recommendations.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidancePage;
