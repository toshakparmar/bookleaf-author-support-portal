import React from 'react';
import { CheckCircle2, CircleDot } from 'lucide-react';
import { PRODUCTION_STAGES, getProductionStageIndex } from '../lib/utils';

export function ProductionStepper({ status }: { status: string }) {
  const currentStageIndex = getProductionStageIndex(status);

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
        <span>Production Progress</span>
        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Stage {currentStageIndex + 1} of {PRODUCTION_STAGES.length}: {PRODUCTION_STAGES[currentStageIndex]}
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[720px]">
          {PRODUCTION_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center group relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600 border-2 border-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <CircleDot className="w-4 h-4 animate-pulse" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1 text-center whitespace-nowrap max-w-[80px] leading-tight ${
                      isCurrent
                        ? 'font-bold text-emerald-800'
                        : isCompleted
                        ? 'font-medium text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </span>
                </div>

                {idx < PRODUCTION_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 transition-all ${
                      idx < currentStageIndex ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
