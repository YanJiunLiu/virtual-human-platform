import { useRef, useEffect, useState, useCallback } from "react";
import { forceRecord } from "../sounder";
import { Rnd } from "react-rnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

interface ReportProps {
  check_data?: CheckData[];
  onChange?: (data: CheckData[]) => void;
}

const Report = (props: ReportProps) => {
  const { check_data, onChange } = props;
  const [markers, setMarkers] = useState<{ id: number; x: number; y: number; width: number; height: number; token?: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastChangeRef = useRef<string>("");
  const onChangeRef = useRef(onChange);

  // Keep the latest onChange reference
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const addMarker = useCallback((x: number, y: number) => {
    const newMarker = {
      id: Date.now(),
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
    };
    setMarkers(prev => [...prev, newMarker]);
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addMarker(x, y);
  }, [addMarker]);

  const updateMarker = useCallback((id: number, data: { x?: number; y?: number; width?: number; height?: number }) => {
    setMarkers(prev =>
      prev.map((m) =>
        m.id === id
          ? {
            ...m,
            x: data.x ?? m.x,
            y: data.y ?? m.y,
            width: data.width ?? m.width,
            height: data.height ?? m.height,
          }
          : m
      )
    );
  }, []);

  // Sync markers back to parent whenever they change content-wise
  useEffect(() => {
    // Break cycle if markers haven't actually changed
    const markersStr = JSON.stringify(markers);
    if (markersStr === lastChangeRef.current) return;

    // Check if we should even sync (e.g. if everything is empty and was empty)
    if (markers.length === 0 && (lastChangeRef.current === "" || lastChangeRef.current === "[]")) return;

    if (!check_data || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;

    const newMarkers = markers.map((m, i) => ({
      index: String(i), // Use numeric index as the token, removing timestamp IDs
      x: (m.x / rect.width) * 100,
      y: (m.y / rect.height) * 100,
      width: (m.width / rect.width) * 100,
      height: (m.height / rect.height) * 100,
    }));

    const updatedCheckData = check_data.map((item, i) => {
      // Exclude id from the item
      const { id, ...rest } = item as any;

      if (i === 0) {
        return {
          ...rest,
          rects: newMarkers,
        };
      }
      return rest;
    });

    lastChangeRef.current = markersStr;
    if (onChangeRef.current) {
      onChangeRef.current(updatedCheckData);
    }
  }, [markers, check_data]);

  return (
    <>
      <div>
        <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
          {check_data?.map((data, index) => (
            <div
              key={index}
              className={`relative border-1 border-gray-200 shadow-sm bg-white overflow-hidden rounded-lg ${index === 2 ? 'col-span-2' : ''}`}
            >
              <div className="bg-gray-100 px-2 py-1 text-xs text-gray-500">
                {data.title || `圖片 ${index + 1}`}
              </div>
              <div
                ref={index === 0 ? containerRef : undefined}
                className="relative"
                onClick={index === 0 ? handleContainerClick : undefined}
              >
                {index === 0 && (
                  <>
                    {markers.map((marker) => (
                      <Rnd
                        key={marker.id}
                        size={{ width: marker.width, height: marker.height }}
                        position={{ x: marker.x, y: marker.y }}
                        onDragStop={(_, d) => updateMarker(marker.id, { x: d.x, y: d.y })}
                        onResizeStop={(_1, _2, ref, _3, position) => {
                          updateMarker(marker.id, {
                            width: ref.offsetWidth,
                            height: ref.offsetHeight,
                            ...position,
                          });
                        }}
                        bounds="parent"
                        className="z-10 border-2 border-osce-blue-5 bg-osce-blue-1/30 group/marker"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent adding a new marker when clicking an existing one
                      >
                        <div className="w-full h-full cursor-move relative">
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setMarkers(markers.filter((m) => m.id !== marker.id));
                            }}
                            className="absolute top-1 right-1 bg-osce-red-5/80 text-white w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/marker:opacity-100 transition-opacity"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                          </button>
                        </div>
                      </Rnd>
                    ))}
                  </>
                )}
                <img
                  className="w-full h-auto select-none"
                  src={data.img}
                  alt={data.title}
                />
                {index !== 0 && data.rects?.map((rect, rIndex) => (
                  <div
                    key={rIndex}
                    className="absolute border-2 border-osce-blue-4 opacity-70 hover:bg-osce-blue-1 transition-colors cursor-pointer"
                    style={{
                      left: `${rect.x}%`,
                      top: `${rect.y}%`,
                      width: `${rect.width}%`,
                      height: `${rect.height}%`,
                    }}
                    onClick={() => forceRecord(rect.index)}
                  />
                ))}
              </div>
            </div>
          ))}
          {!check_data && (
            <>
              <img className='max-w-1/2' src="./img/p1.jpg" />
              <div className="relative">
                <img className="" src="./img/p2.jpg" />
                <div style={{ top: "30%", left: "30%" }} onClick={() => {
                  forceRecord("token")
                }} className='absolute top-0 left-0 bg-osce-blue-4 text-white w-[50px] h-[30px] rounded opacity-80'></div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Report;

