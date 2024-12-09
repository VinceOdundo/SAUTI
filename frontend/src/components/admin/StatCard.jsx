import React from "react";

const StatCard = ({ title, icon: Icon, stats }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <div className="mt-4 space-y-3">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-baseline justify-between"
                  >
                    <dt className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value.toLocaleString()}
                      </div>
                      {stat.change && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stat.change >= 0 ? "+" : ""}
                          {stat.change}%
                        </div>
                      )}
                    </dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>
        </div>
      </div>
      {stats.some((stat) => stat.previousValue) && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-gray-500">Previous period: </span>
            {stats
              .filter((stat) => stat.previousValue)
              .map((stat, index, array) => (
                <span key={index}>
                  {stat.label}: {stat.previousValue.toLocaleString()}
                  {index < array.length - 1 ? ", " : ""}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
