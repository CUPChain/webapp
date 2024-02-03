import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { assert, expect } from "chai";

const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
const MINTER_ROLE = ethers.id("MINTER_ROLE");

describe.only("Prescription Contract", function () {
    async function deploymentFixture() {
        const [owner, address1, address2] = await ethers.getSigners();

        const prescriptionContract = await ethers.deployContract("PrescriptionTokens");

        await prescriptionContract.waitForDeployment();

        const appointmentContract = await ethers.deployContract("AppointmentTokens", [prescriptionContract.target]);

        await appointmentContract.waitForDeployment();

        return { prescriptionContract, appointmentContract, owner , address1, address2 };
    }

    describe.only("Deployment", function () {
        it("Deployer has default admin role", async function () {
            const { 
                prescriptionContract, 
                appointmentContract, 
                owner, 
                address1 , 
                address2 
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;

            expect(await appointmentContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Other role's admin is the default admin role", async function () {
            const { 
                prescriptionContract, 
                appointmentContract, 
                owner, 
                address1 , 
                address2 
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        })
    });

    describe.only("Granting roles", function () {
        it("Should grant minter role correctly", async function () {
            const { 
                prescriptionContract, 
                appointmentContract, 
                owner, 
                address1 , 
                address2 
            } = await loadFixture(deploymentFixture);

            await expect(prescriptionContract.connect(owner).grantRole(address1))
                .to.emit(prescriptionContract, "RoleGranted").withArgs(MINTER_ROLE, address1, owner);
            
            it("Doctor should have minter role", async function () {
                expect (await prescriptionContract.hasRole(MINTER_ROLE, address1)).to.be.true;
            })
        });

        it("Should not grant minter role", async function () {
            const { 
                prescriptionContract, 
                appointmentContract, 
                owner, 
                address1 , 
                address2 
            } = await loadFixture(deploymentFixture);

            await expect(prescriptionContract.connect(address1).grantRole(address2))
                .to.be.revertedWithCustomError(prescriptionContract, "CallerNotAdmin");

            it("Doctor should not have minter role", async function () {
                expect (await prescriptionContract.hasRole(MINTER_ROLE, address1)).to.be.false;
            });
        })
    });
});