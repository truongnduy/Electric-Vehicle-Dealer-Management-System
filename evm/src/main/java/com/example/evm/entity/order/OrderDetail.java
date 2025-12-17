package com.example.evm.entity.order;

import java.math.BigDecimal;

import com.example.evm.entity.promotion.Promotion;
import com.example.evm.entity.vehicle.Vehicle;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "OrderDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orderdetail_id")
    private Long orderDetailId;

    // Quan hệ nhiều-1 với Order
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Quan hệ nhiều-1 với Vehicle
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Quan hệ nhiều-1 với Promotion (có thể null nếu không có khuyến mãi)
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @Column(name = "quantity")
    private Integer quantity;

    // Thông tin xe tại thời điểm đặt hàng (để lưu lịch sử chính xác)
    @Column(name = "vehicle_name", length = 255)
    private String vehicleName;

    @Column(name = "vehicle_color", length = 50)
    private String vehicleColor;

    @Column(name = "vin_numbers", columnDefinition = "TEXT")
    private String vinNumbers;

    // Thông tin giá - Sử dụng BigDecimal cho precision và scale
    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "price", precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_amount", precision = 18, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "notes", length = 500)
    private String notes;

    // Helper method để tính tổng tiền cho detail này
    public BigDecimal getTotalPrice() {
        if (price == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    // Helper method để apply promotion
    public void applyPromotion(Promotion promotion) {
        if (promotion != null && promotion.getDiscountRate() != null && this.price != null) {
            this.promotion = promotion;
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    BigDecimal.valueOf(promotion.getDiscountRate()).divide(BigDecimal.valueOf(100)));
            this.price = this.price.multiply(discountMultiplier);
        }
    }

    @Override
    public String toString() {
        // Sử dụng vehicleName đã lưu, nếu không có thì lấy từ vehicle
        String vehicleNameStr = vehicleName != null ? vehicleName : "N/A";
        if (vehicleNameStr.equals("N/A") && vehicle != null && vehicle.getVariant() != null) {
            if (vehicle.getVariant().getModel() != null) {
                vehicleNameStr = vehicle.getVariant().getModel().getName() + " " + vehicle.getVariant().getName();
            } else {
                vehicleNameStr = vehicle.getVariant().getName();
            }
        }

        return "OrderDetail{" +
                "orderDetailId=" + orderDetailId +
                ", vehicle=" + vehicleNameStr +
                ", color=" + (vehicleColor != null ? vehicleColor : "N/A") +
                ", vinNumbers=" + (vinNumbers != null ? vinNumbers : "N/A") +
                ", promotion=" + (promotion != null ? promotion.getTitle() : "null") +
                ", quantity=" + quantity +
                ", price=" + price +
                '}';
    }

    // Helper methods để expose ID
    public Long getOrderId() {
        return order != null ? order.getOrderId() : null;
    }

    public Long getVehicleId() {
        return vehicle != null ? vehicle.getVehicleId() : null;
    }

    public Long getPromotionId() {
        return promotion != null ? promotion.getPromoId() : null;
    }
}