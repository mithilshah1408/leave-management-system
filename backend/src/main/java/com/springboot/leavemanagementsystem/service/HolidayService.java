package springboot.leavemanagementsystem.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.leavemanagementsystem.dto.CreateHolidayRequest;
import springboot.leavemanagementsystem.dto.HolidayResponse;
import springboot.leavemanagementsystem.dto.UpdateHolidayRequest;
import springboot.leavemanagementsystem.entity.Holiday;
import springboot.leavemanagementsystem.repository.HolidayRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public HolidayResponse createHoliday(CreateHolidayRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        Holiday holiday = new Holiday(request.getName(), request.getStartDate(), request.getEndDate());
        return mapToDto(holidayRepository.save(holiday));
    }

    public HolidayResponse updateHoliday(Long id, UpdateHolidayRequest request) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Holiday not found"));

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        holiday.setName(request.getName());
        holiday.setStartDate(request.getStartDate());
        holiday.setEndDate(request.getEndDate());

        return mapToDto(holidayRepository.save(holiday));
    }

    public void deleteHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Holiday not found"));
        holidayRepository.delete(holiday);
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> getHolidaysByYear(int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);
        return holidayRepository.findOverlappingHolidays(startOfYear, endOfYear)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private HolidayResponse mapToDto(Holiday holiday) {
        return new HolidayResponse(
                holiday.getId(),
                holiday.getName(),
                holiday.getStartDate(),
                holiday.getEndDate()
        );
    }
}
